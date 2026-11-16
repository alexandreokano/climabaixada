import { readFile, writeFile } from 'node:fs/promises';

const FILE = process.env.OUT || 'dados.json';
const BASE = process.env.CETESB_API || 'https://arcgis.cetesb.sp.gov.br/server/rest/services/Hosted/Praias/FeatureServer/0';
const UA = 'Mozilla/5.0 (compatible; ClimaBaixadaBot/1.0; +https://climabaixada.com.br/)';
const TZ = 'America/Sao_Paulo';
const MIN = 0.6; // fração mínima de praias reconhecidas para gravar

const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// nome no dados.json -> nome na CETESB (só os que diferem), por município
const ALIAS = {
  'Santos': { 'José Menino': 'JOSÉ MENINO - R. FRED. OZANAN' },
  'São Vicente': { 'Ilha Porchat': 'PRAIA DA ILHA PORCHAT' },
  'Guarujá': {
    'Pitangueiras - R. Silvia Valadão': 'PITANGUEIRAS - R. S. VALADÃO',
    'Enseada - Estrada de Pernambuco': 'ENSEADA - ESTR. PERNAMBUCO',
    'Enseada - Rua Chile': 'ENSEADA - R. CHILE'
  },
  'Praia Grande': { 'Vila Tupy': 'VILA TUPI', 'Flórida': 'BALNEARIO FLÓRIDA' },
  'Bertioga': {
    'Enseada - R. Rafael Costabili': 'ENSEADA - R. R. COSTABILE',
    'Indaiá (Enseada)': 'ENSEADA - INDAIÁ',
    'Enseada - Colônia do SESC': 'ENSEADA - COL. SESC',
    'São Lourenço - junto ao morro': 'SÃO LOURENÇO - PROX. MORRO'
  },
  'Itanhaém': {
    'Balneário Jardim Regina': 'BALN. JD. REGINA',
    'Balneário Gaivotas': 'BALNEÁRIO GAIVOTA',
    'Jardim Suarão': 'SUARÃO'
  },
  'Mongaguá': { 'Itapoã (Vila São Paulo)': 'VILA SÃO PAULO' },
  'Peruíbe': { 'Balneário São João Batista': 'BALN. S. J. BATISTA' }
};

async function get(url) {
  for (let i = 1; i <= 3; i++) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 25000);
    try {
      const r = await fetch(url, { signal: c.signal, headers: { 'user-agent': UA, accept: 'application/json' } });
      if (r.ok) {
        const j = await r.json();
        if (j.error) throw new Error('API: ' + (j.error.message || JSON.stringify(j.error)));
        return j;
      }
      if (r.status !== 429 && r.status < 500) throw new Error('HTTP ' + r.status);
    } catch (e) { if (i === 3) throw e; }
    finally { clearTimeout(t); }
    await new Promise(r => setTimeout(r, 2000 * i));
  }
  throw new Error('sem resposta');
}

async function baixar() {
  const feats = [];
  for (let off = 0, pag = 0; pag < 5; pag++) {
    const url = `${BASE}/query?where=1%3D1&outFields=municipio,praia,qualidade,data_atual&returnGeometry=false&orderByFields=objectid&resultRecordCount=2000&resultOffset=${off}&f=json`;
    const j = await get(url);
    const lote = (j.features || []).map(f => f.attributes).filter(Boolean);
    feats.push(...lote);
    if (!j.exceededTransferLimit || !lote.length) break;
    off += lote.length;
  }
  return feats;
}

const dados = JSON.parse(await readFile(FILE, 'utf8'));
if (!dados.cetesb) { console.error('dados.json sem campo "cetesb".'); process.exit(1); }

let feats;
try { feats = await baixar(); }
catch (e) { console.error('Falha ao consultar a CETESB: ' + e.message); process.exit(1); }
if (feats.length < 50) { console.error(`Resposta pequena demais (${feats.length} praias). Nada foi gravado.`); process.exit(1); }

// índice: município|praia (normalizados) -> qualidade
const idx = new Map();
let dataMax = 0;
for (const f of feats) {
  if (typeof f.data_atual === 'number' && f.data_atual > dataMax) dataMax = f.data_atual;
  if (f.qualidade !== 0 && f.qualidade !== 1) continue; // valor desconhecido: ignora
  idx.set(norm(f.municipio) + '|' + norm(f.praia), f.qualidade);
}

const muns = Object.keys(dados.cetesb);
const total = muns.reduce((s, m) => s + dados.cetesb[m].length, 0);
const usadas = new Set();
const novos = {};
let achadas = 0;

for (const m of muns) {
  dados.cetesb[m].forEach((p, i) => {
    const nome = p[0];
    const cands = [ALIAS[m]?.[nome], nome, nome.replace(/\(.*?\)/g, '')]
      .filter(Boolean).map(n => norm(m) + '|' + norm(n));
    const k = cands.find(c => idx.has(c));
    if (!k) return;
    usadas.add(k);
    (novos[m] ||= {})[i] = idx.get(k) === 1 ? 0 : 2; // API 1=própria -> 0 ; API 0=imprópria -> 2
    achadas++;
  });
}

console.log(`API: ${feats.length} praias. Reconhecidas: ${achadas}/${total}.`);
if (achadas / total < MIN) {
  console.error('Poucas praias reconhecidas. Nada foi gravado.');
  process.exit(1);
}

let mudou = 0;
const faltam = [], alteradas = [];
for (const m of muns) {
  dados.cetesb[m].forEach((p, i) => {
    const v = novos[m]?.[i];
    if (v === undefined) { faltam.push(`${m} / ${p[0]}`); return; }
    if (p[1] !== v) { alteradas.push(`${m} / ${p[0]}: ${p[1]} -> ${v}`); p[1] = v; mudou++; }
  });
}
console.log(`Alteradas: ${mudou}.`);
if (alteradas.length) console.log(' - ' + alteradas.join('\n - '));
if (faltam.length) console.warn('Não reconhecidas (mantive o valor anterior):\n - ' + faltam.join('\n - '));

// praias que a CETESB tem nos nossos municípios e o app não acompanha (ex.: Iporanga)
const ignorar = new Set(muns.map(norm));
const extras = feats.filter(f => ignorar.has(norm(f.municipio)) && !usadas.has(norm(f.municipio) + '|' + norm(f.praia)))
  .map(f => `${f.municipio} / ${f.praia}`);
if (extras.length) console.log('Na CETESB e fora do app:\n - ' + extras.join('\n - '));

if (dataMax) {
  dados.boletim_cetesb = new Date(dataMax).toLocaleDateString('sv-SE', { timeZone: TZ });
} else {
  console.warn('data_atual ausente; mantive ' + dados.boletim_cetesb);
}

await writeFile(FILE, JSON.stringify(dados, null, 2) + '\n');
console.log(`Gravado ${FILE}. Boletim: ${dados.boletim_cetesb}.`);