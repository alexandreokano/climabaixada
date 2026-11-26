import { readFileSync } from 'node:fs';

// Simulação SÓ DE LEITURA: não altera nenhum arquivo.
// Aproximação: usa o cache do Open-Meteo (2 modelos), sem CPTEC e sem tábua de maré.
const html = readFileSync('index.html', 'utf8');
const m = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
if (!m) { console.error('Marcadores SEMAFORO-INI/FIM não achados.'); process.exit(1); }
const { kayakV, surfV, limitaHora } = new Function(m[1] + ';return {kayakV,surfV,limitaHora}')();

const lerJson = a => JSON.parse(readFileSync(a, 'utf8'));
const F = lerJson('cache/forecast/-23.980_-46.313.json');
const M = lerJson('cache/marine/-23.980_-46.313.json');
const dados = lerJson('dados.json');

// Mesmo formato do S.live do index.html (loadLive)
const L = {};
const hf = F.dados.hourly, hm = M.dados.hourly;
hf.time.forEach((t, i) => {
  L[t] = { ...(L[t] || {}), ws: hf.wind_speed_10m[i], wg: hf.wind_gusts_10m[i], wd: hf.wind_direction_10m[i],
    rain: hf.precipitation[i], pp: hf.precipitation_probability[i], wc: hf.weather_code ? hf.weather_code[i] : null };
});
hm.time.forEach((t, i) => {
  L[t] = { ...(L[t] || {}), wh: hm.wave_height[i], wp: hm.wave_period[i] };
});

const EMO = ['🟢', '🟡', '🔴', '⚪'];
const pad = n => String(n).padStart(2, '0');
const e = l => EMO[l == null ? 3 : l];
const H0 = 5, H1 = 18;

console.log(`Cache forecast gerado em ${F.gerado_em} | marine em ${M.gerado_em}`);
console.log('Horas simuladas: ' + pad(H0) + 'h a ' + pad(H1) + 'h. Maré: sem tábua (null = tratado como vazante) e enchente.\n');

for (const d of dados.dias) {
  if (d.date < '2026-11-26' || d.date > '2026-11-30') continue;
  const hs = [];
  for (let h = H0; h <= H1; h++) {
    const o = L[`${d.date}T${pad(h)}:00`];
    const nx = L[`${d.date}T${pad(h + 1)}:00`];
    const oo = o ? { ...o, tsNext: !!(nx && typeof nx.wc == 'number' && nx.wc >= 95) } : null;
    hs.push({ h, oo });
  }
  const sem = hs.filter(x => !x.oo).length;
  const rodar = (fn, nivelDia, tide) => hs.map(x => {
    const raw = fn(x.oo, tide);
    return { h: x.h, raw, lim: limitaHora(nivelDia, raw) };
  });
  const cont = (arr, k) => [0, 1, 2].map(n => arr.filter(x => x[k].l === n).length);
  const relat = (nome, arr, nivelDia) => {
    const r = cont(arr, 'raw'), c = cont(arr, 'lim');
    const subidas = arr.filter(x => x.raw.l != null && x.lim.l > x.raw.l).length;
    console.log(`  ${nome}`);
    console.log('    por hora (sem trava): ' + arr.map(x => pad(x.h) + e(x.raw.l)).join(' '));
    console.log(`    sem trava: 🟢${r[0]} 🟡${r[1]} 🔴${r[2]} | com limitaHora: 🟢${c[0]} 🟡${c[1]} 🔴${c[2]} | horas que a trava sobe: ${subidas}`);
    const motivos = {};
    arr.forEach(x => (x.raw.r || []).forEach(t => { const k = t.replace(/[\d.,]+/g, '#'); motivos[k] = (motivos[k] || 0) + 1; }));
    const top = Object.entries(motivos).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k} (${v}h)`).join('; ');
    console.log('    motivos mais comuns: ' + top);
  };
  console.log(`=== ${d.lbl} (${d.date}) | veredito do dia (dados.json): caiaque ${e(d.k)} surfe ${e(d.s)}${sem ? ` | ATENÇÃO: ${sem} hora(s) sem dado` : ''}`);
  relat('Caiaque, sem tábua de maré', rodar(kayakV, d.k, null), d.k);
  relat('Caiaque, com enchente', rodar(kayakV, d.k, { state: 'enchente' }), d.k);
  relat('Surfe', rodar(surfV, d.s), d.s);
  console.log('');
}
