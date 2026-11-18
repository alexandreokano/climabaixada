import { readFile, writeFile } from 'node:fs/promises';

const OUT = process.env.OUT || 'cptec.json';
const ID = 4748; // Santos
const DIAS = [0, 1, 2];
const UA = 'Mozilla/5.0 (compatible; ClimaBaixadaBot/1.0; +https://climabaixada.com.br/)';

async function get(url) {
  for (let t = 1; t <= 3; t++) {
    const c = new AbortController();
    const to = setTimeout(() => c.abort(), 15000);
    try {
      const r = await fetch(url, { signal: c.signal, headers: { 'user-agent': UA } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      // o CPTEC responde em ISO-8859-1
      return new TextDecoder('latin1').decode(await r.arrayBuffer());
    } catch (e) {
      if (t === 3) throw e;
      await new Promise(r => setTimeout(r, 1500 * t));
    } finally { clearTimeout(to); }
  }
}

const tag = (s, n) => {
  const m = s.match(new RegExp('<' + n + '>([^<]*)</' + n + '>'));
  return m ? m[1].trim() : '';
};

function parse(xml) {
  if (!xml.includes('<cidade>') || !/<nome>\s*Santos\s*<\/nome>/.test(xml)) throw new Error('XML inesperado');
  const itens = [];
  for (const p of ['manha', 'tarde', 'noite']) {
    const b = xml.match(new RegExp('<' + p + '>([\\s\\S]*?)</' + p + '>'));
    if (!b) continue;
    const m = tag(b[1], 'dia').match(/^(\d{2})-(\d{2})-(\d{4}) (\d{2})h/);
    if (!m) continue;
    // horário vem em UTC ("Z"); converte para Brasília (UTC-3)
    const loc = new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], +m[4]) - 3 * 3600000);
    const wh = parseFloat(tag(b[1], 'altura'));
    const wv = parseFloat(tag(b[1], 'vento'));
    if (!isFinite(wh) || wh < 0 || wh > 15) continue;
    itens.push({
      date: loc.toISOString().slice(0, 10),
      h: loc.getUTCHours(),
      wh,
      ws: isFinite(wv) && wv >= 0 && wv < 60 ? Math.round(wv * 1.944 * 10) / 10 : null, // m/s -> nós
      wvd: tag(b[1], 'vento_dir'),
      agit: tag(b[1], 'agitacao')
    });
  }
  const at = tag(xml, 'atualizacao').match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return { itens, atual: at ? `${at[3]}-${at[2]}-${at[1]}` : null };
}

let antigo = { itens: [] };
try { antigo = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
if (!Array.isArray(antigo.itens)) antigo.itens = [];

const novos = new Map();
let falhas = 0, atual = null;
for (const d of DIAS) {
  try {
    const r = parse(await get(`https://servicos.cptec.inpe.br/XML/cidade/${ID}/dia/${d}/ondas.xml`));
    if (!r.itens.length) throw new Error('sem itens');
    if (r.atual && (!atual || r.atual > atual)) atual = r.atual;
    r.itens.forEach(i => novos.set(i.date + '|' + i.h, i));
  } catch (e) {
    falhas++;
    console.warn(`::warning::CPTEC dia ${d}: ${e.message}`);
  }
}

if (falhas === DIAS.length) {
  console.error('Todas as consultas ao CPTEC falharam. Arquivo anterior mantido.');
  process.exit(1);
}

// completa com itens antigos só se algum dia falhou; descarta o que for anterior a ontem
const ontem = new Date(Date.now() - 27 * 3600000).toISOString().slice(0, 10);
const mapa = new Map(novos);
if (falhas > 0) antigo.itens.forEach(i => { const k = i.date + '|' + i.h; if (!mapa.has(k)) mapa.set(k, i); });
const itens = [...mapa.values()]
  .filter(i => i.date >= ontem)
  .sort((a, b) => (a.date + String(a.h).padStart(2, '0')).localeCompare(b.date + String(b.h).padStart(2, '0')));

const saida = {
  gerado_em: new Date().toISOString(),
  fonte: 'CPTEC/INPE (servicos.cptec.inpe.br), cidade 4748 (Santos)',
  atualizacao_cptec: atual,
  parcial: falhas > 0,
  itens
};
await writeFile(OUT, JSON.stringify(saida, null, 2) + '\n');
console.log(`Gravado ${OUT}: ${itens.length} itens, atualização do CPTEC em ${atual}${falhas ? ' (PARCIAL)' : ''}.`);
