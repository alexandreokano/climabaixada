import { readFileSync } from 'node:fs';

const FILE = process.argv[2] || process.env.MARES || 'mares.json';
const TZ = '-03:00';
const erros = [], avisos = [];

let j;
const raw = readFileSync(FILE, 'utf8');
try { j = JSON.parse(raw); }
catch (e) { console.error('JSON inválido: ' + e.message); process.exit(1); }

// JSON.parse aceita chave repetida em silêncio (a última vence): detectar no texto bruto
const cont = new Map();
for (const m of raw.matchAll(/"(\d{4}-\d{2}-\d{2})"\s*:/g)) cont.set(m[1], (cont.get(m[1]) || 0) + 1);
const rep = [...cont].filter(([, n]) => n > 1).map(([d]) => d);
if (rep.length) erros.push(`${rep.length} data(s) repetida(s) no arquivo (ex.: ${rep.slice(0, 3).join(', ')}). Regrave com JSON.stringify.`);
if (!j || typeof j !== 'object' || Array.isArray(j)) { console.error('Raiz deve ser um objeto {data: [...]}.'); process.exit(1); }

const dias = Object.keys(j).sort();
if (!dias.length) { console.error('Arquivo vazio.'); process.exit(1); }

const ev = [];
for (const d of dias) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d) || isNaN(Date.parse(d + 'T12:00:00Z'))) { erros.push(`${d}: data inválida`); continue; }
  if (!Array.isArray(j[d]) || !j[d].length) { erros.push(`${d}: sem eventos`); continue; }
  if (j[d].length < 3 || j[d].length > 6) avisos.push(`${d}: ${j[d].length} eventos (a DHN traz de 3 a 6)`);
  for (const e of j[d]) {
    if (!Array.isArray(e) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(e[0]) || (e[1] !== 'A' && e[1] !== 'B')) { erros.push(`${d}: evento mal formado ${JSON.stringify(e)}`); continue; }
    if (typeof e[2] !== 'number' || !isFinite(e[2]) || e[2] < -0.6 || e[2] > 2.2) { erros.push(`${d} ${e[0]}: altura fora do normal (${e[2]})`); continue; }
    ev.push({ d, h: e[0], t: e[1], v: e[2], ms: Date.parse(`${d}T${e[0]}:00${TZ}`) });
  }
}

// dias seguidos, sem buracos
for (let i = 1; i < dias.length; i++) {
  const esp = new Date(Date.parse(dias[i - 1] + 'T12:00:00Z') + 864e5).toISOString().slice(0, 10);
  if (dias[i] !== esp) erros.push(`faltam dias entre ${dias[i - 1]} e ${dias[i]}`);
}

// ordem, alternância e intervalos
for (let i = 1; i < ev.length; i++) {
  const a = ev[i - 1], b = ev[i], h = (b.ms - a.ms) / 36e5;
  const nome = `${a.d} ${a.h} → ${b.d} ${b.h}`;
  if (h <= 0) { erros.push(`${nome}: fora de ordem`); continue; }
  if (a.t === b.t) avisos.push(`${nome}: dois '${a.t}' seguidos (vem assim da DHN; não corrija à mão)`);
  else if (a.t === 'A' && b.v > a.v) avisos.push(`${nome}: preamar ${a.v} menor que baixa-mar ${b.v}`);
  else if (a.t === 'B' && b.v < a.v) avisos.push(`${nome}: baixa-mar ${a.v} maior que preamar ${b.v}`);
  if (h > 9) avisos.push(`${nome}: intervalo de ${h.toFixed(1)} h (faltam eventos?)`);
  if (h < 1) avisos.push(`${nome}: intervalo de só ${h.toFixed(1)} h`);
}

// validade
const fim = dias[dias.length - 1];
const resta = (Date.parse(fim + 'T12:00:00Z') - Date.now()) / 864e5;
if (resta < 0) erros.push(`a tábua acabou em ${fim}`);
else if (resta < 45) avisos.push(`a tábua acaba em ${fim} (faltam ${Math.floor(resta)} dias): gere a do próximo ano`);

console.log(`${FILE}: ${dias.length} dias (${dias[0]} a ${fim}), ${ev.length} eventos.`);
avisos.forEach(a => console.warn('::warning::' + a));
erros.forEach(e => console.error('::error::' + e));
if (erros.length) { console.error(`${erros.length} erro(s).`); process.exit(1); }
console.log(`OK (${avisos.length} aviso(s)).`);
