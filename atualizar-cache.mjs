import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const HTML = process.env.HTML || 'index.html';
const OUT = process.env.OUT || 'cache';
const UA = 'Mozilla/5.0 (compatible; ClimaBaixadaBot/1.0; +https://climabaixada.com.br/)';
const TZ = 'America%2FSao_Paulo';
// Mesmas variáveis que o painel usa (união de todas as telas)
const FC = 'wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,temperature_2m,apparent_temperature,precipitation_probability,cloud_cover';
const MR = 'wave_height,wave_period,wave_direction,sea_surface_temperature';

// Mesma chave do painel (ckey em index.html)
const key = (la, lo) => la.toFixed(3) + '_' + lo.toFixed(3);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Lê os bairros direto do index.html, para não duplicar a lista
const html = await readFile(HTML, 'utf8');
const mp = html.match(/const PLACES=(\{[\s\S]*?\n\});/);
const mv = html.match(/const VB=\{la:(-?[\d.]+),lo:(-?[\d.]+)\}/);
if (!mp || !mv) { console.error('Não achei PLACES ou VB em ' + HTML); process.exit(1); }
const PLACES = new Function('return ' + mp[1])();
const VB = { la: +mv[1], lo: +mv[2] };

const jobs = new Map();
const add = (kind, la, lo, url) => jobs.set(kind + '/' + key(la, lo), { kind, la, lo, url });
for (const list of Object.values(PLACES)) {
  for (const [, la, lo, sea] of list) {
    add('forecast', la, lo, `https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&hourly=${FC}&wind_speed_unit=kn&timezone=${TZ}&forecast_days=10`);
    if (sea) add('marine', la, lo, `https://marine-api.open-meteo.com/v1/marine?latitude=${(la - 0.06).toFixed(3)}&longitude=${(lo + 0.03).toFixed(3)}&hourly=${MR}&timezone=${TZ}&forecast_days=7`);
  }
}
add('forecast16', VB.la, VB.lo, `https://api.open-meteo.com/v1/forecast?latitude=${VB.la}&longitude=${VB.lo}&hourly=${FC}&wind_speed_unit=kn&timezone=${TZ}&forecast_days=16`);

async function get(url) {
  for (let i = 1; i <= 3; i++) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 20000);
    try {
      const r = await fetch(url, { signal: c.signal, headers: { 'user-agent': UA } });
      if (r.ok) return await r.json();
      if (r.status !== 429 && r.status < 500) throw new Error('HTTP ' + r.status);
    } catch (e) {
      if (i === 3) throw e;
    } finally { clearTimeout(t); }
    await sleep(2000 * i);
  }
  throw new Error('Open-Meteo não respondeu');
}

let ok = 0, falhas = 0;
for (const [nome, j] of jobs) {
  try {
    const dados = await get(j.url);
    if (!dados || !dados.hourly || !Array.isArray(dados.hourly.time)) throw new Error('resposta sem hourly');
    const arq = `${OUT}/${nome}.json`;
    await mkdir(dirname(arq), { recursive: true });
    await writeFile(arq, JSON.stringify({ gerado_em: new Date().toISOString(), fonte: 'open-meteo', dados }));
    ok++;
  } catch (e) {
    // Mantém o arquivo anterior; o painel ignora cache com mais de 3 h e consulta o Open-Meteo direto
    falhas++;
    console.warn(`::warning::${nome}: ${e.message}`);
  }
  await sleep(250);
}

console.log(`Cache: ${ok} gravados, ${falhas} falhas, ${jobs.size} no total.`);
if (!ok) process.exit(1);