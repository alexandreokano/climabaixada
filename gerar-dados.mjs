import { readFile, writeFile } from 'node:fs/promises';

const OUT = process.env.OUT || 'dados.json';
const DAYS = +process.env.DAYS || 5;
const TZ = 'America/Sao_Paulo';
const UA = 'Mozilla/5.0 (compatible; ClimaBaixadaBot/1.0; +https://climabaixada.com.br/)';
const W = { la: -23.99, lo: -46.30 };   // vento/chuva: baía de Santos
const M = { la: -24.05, lo: -46.27 };   // ondas: ponto no mar
const FM = ['ecmwf_ifs025', 'gfs_seamless'];
const MM = ['ecmwf_wam025', 'ncep_gfswave025'];
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  for (let i = 1; i <= 3; i++) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 20000);
    try {
      const r = await fetch(url, { signal: c.signal, headers: { 'user-agent': UA } });
      if (r.ok) return await r.json();
      if (r.status !== 429 && r.status < 500) throw new Error('HTTP ' + r.status);
    } catch (e) { if (i === 3) throw e; }
    finally { clearTimeout(t); }
    await sleep(2000 * i);
  }
  throw new Error('sem resposta');
}

const tzq = encodeURIComponent(TZ);
const fcUrl = m => `https://api.open-meteo.com/v1/forecast?latitude=${W.la}&longitude=${W.lo}&hourly=wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,precipitation_probability,weather_code&models=${m}&wind_speed_unit=kn&timezone=${tzq}&forecast_days=${DAYS + 1}`;
const mrUrl = m => `https://marine-api.open-meteo.com/v1/marine?latitude=${M.la}&longitude=${M.lo}&hourly=wave_height,wave_period&models=${m}&timezone=${tzq}&forecast_days=${DAYS + 1}`;

// agrupa horas 06h–17h por dia
function byDay(h, fields) {
  const days = {};
  (h.time || []).forEach((t, i) => {
    const hr = +t.slice(11, 13);
    if (hr < 6 || hr > 17) return;
    const d = t.slice(0, 10);
    (days[d] ||= []).push(Object.fromEntries(fields.map(f => [f, h[f]?.[i]])));
  });
  return days;
}
const nums = (a, f) => a.map(x => x[f]).filter(v => typeof v === 'number');
const max = a => (a.length ? Math.max(...a) : null);
const mean = a => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);
const sum = a => a.reduce((s, v) => s + v, 0);

async function modelos(urls, fields, tratar) {
  const res = [];
  for (const u of urls) {
    try {
      const j = await get(u);
      res.push(byDay(j.hourly, fields));
      console.log('OK  ' + u.split('models=')[1].split('&')[0]);
    } catch (e) { console.warn('::warning::' + u.split('models=')[1].split('&')[0] + ': ' + e.message + (e.cause ? ' (' + (e.cause.code || e.cause.message) + ')' : '')); }
    await sleep(300);
  }
  return res;
}

const FIELDS_F = ['wind_speed_10m', 'wind_gusts_10m', 'wind_direction_10m', 'precipitation', 'precipitation_probability', 'weather_code'];
const FIELDS_M = ['wave_height', 'wave_period'];
const fc = await modelos(FM.map(fcUrl), FIELDS_F);
const mr = await modelos(MM.map(mrUrl), FIELDS_M);
if (!fc.length || !mr.length) {
  console.error(`::error::Dados incompletos (vento/chuva: ${fc.length}/${FM.length} modelos; ondas: ${mr.length}/${MM.length}). dados.json anterior mantido.`);
  process.exit(1);
}
const parcial = fc.length < FM.length || mr.length < MM.length;
if (parcial) console.warn('::warning::Só parte dos modelos respondeu; avaliação menos conservadora.');

const hoje = new Date().toLocaleDateString('sv-SE', { timeZone: TZ });
const datas = [...new Set([...fc, ...mr].flatMap(m => Object.keys(m)))].filter(d => d >= hoje).sort().slice(0, DAYS);

const NOMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const PTS = ['N', 'NNE', 'NE', 'ENE', 'L', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const compass = deg => PTS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
const r0 = v => Math.round(v);

function dirMedia(arr) {
  const v = arr.flatMap(m => nums(m, 'wind_direction_10m'));
  if (!v.length) return null;
  const x = mean(v.map(d => Math.cos(d * Math.PI / 180)));
  const y = mean(v.map(d => Math.sin(d * Math.PI / 180)));
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

const dias = datas.map(date => {
  const F = fc.map(m => m[date]).filter(Boolean);
  const O = mr.map(m => m[date]).filter(Boolean);
  const vento = max(F.map(a => max(nums(a, 'wind_speed_10m'))).filter(v => v != null));
  const raj = max(F.map(a => max(nums(a, 'wind_gusts_10m'))).filter(v => v != null));
  const precip = max(F.map(a => sum(nums(a, 'precipitation'))));
  const prob = max(F.map(a => max(nums(a, 'precipitation_probability'))).filter(v => v != null));
  const trov = F.some(a => nums(a, 'weather_code').some(c => c >= 95));
  const onda = max(O.map(a => max(nums(a, 'wave_height'))).filter(v => v != null));
  const per = mean(O.map(a => mean(nums(a, 'wave_period'))).filter(v => v != null));
  const ondaMin = O.length > 1 ? Math.min(...O.map(a => max(nums(a, 'wave_height')) ?? 0)) : onda;
  const ventoMin = F.length > 1 ? Math.min(...F.map(a => max(nums(a, 'wind_speed_10m')) ?? 0)) : vento;
  const dir = dirMedia(F);
  const sul = dir != null && dir > 100 && dir < 260;
  const motivos = [];

  // ----- Caiaque (0 verde, 1 amarelo, 2 vermelho)
  let k = 0;
  if (vento != null) {
    if (vento > 15 || (raj != null && raj > 20)) { k = 2; motivos.push('vento/rajadas acima do limite do caiaque'); }
    else if (vento >= 11 || (raj != null && raj > 15)) { k = Math.max(k, 1); motivos.push('vento moderado ou rajadas'); }
  }
  if (onda != null) {
    if (onda > 1.0) { k = 2; motivos.push('ondas acima de 1,0 m'); }
    else if (onda >= 0.8) { k = Math.max(k, 1); motivos.push('ondas perto de 1,0 m'); }
  }
  if (per != null && per < 6 && vento >= 8) { k = Math.max(k, 1); motivos.push('mar curto e batido'); }
  if (trov || (precip != null && precip >= 10)) { k = 2; motivos.push('risco de trovoadas ou chuva forte'); }
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) { k = Math.max(k, 1); motivos.push('pancadas de chuva'); }

  // ----- Surfe iniciante
  let s = 0;
  if (onda != null && onda < 0.4) { s = 1; }
  if (onda != null && onda > 1.2) s = Math.max(s, 1);
  if (onda != null && onda > 1.8) s = 2;
  if (vento != null && vento > 15) s = 2;
  else if (vento != null && vento >= 11) s = Math.max(s, 1);
  if (trov || (precip != null && precip >= 10)) s = 2;
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) s = Math.max(s, 1);

  const [dd, mm] = [date.slice(8, 10), date.slice(5, 7)];
  const lbl = NOMES[new Date(date + 'T12:00:00Z').getUTCDay()] + ' ' + dd;
  const veredito = ['Condições favoráveis', 'Atenção', 'Não navegue'][k];
  const diverge = (onda != null && ondaMin != null && onda - ondaMin > 0.3) || (vento != null && ventoMin != null && vento - ventoMin > 4);
  const extra = [];
  if (sul && vento >= 12) extra.push('Vento sul acima de 12 nós: confira a maré; se estiver vazante, evite a Fortaleza da Barra e o Deck do Pescador.');
  if (diverge) extra.push('Os modelos divergem: adotei o mais conservador.');
  if (parcial) extra.push('Só parte dos modelos respondeu: avaliação menos conservadora.');
  extra.push('Confirme a tábua de marés antes de sair.');

  if (vento == null || onda == null || precip == null) {
    console.warn(`::warning::${date} descartado: faltam dados de vento, ondas ou chuva.`);
    return null;
  }

  return {
    date, lbl, k, s,
    vento: vento == null ? 'sem dados' : `${dir != null ? compass(dir) + ' ' : ''}até ${r0(vento)} nós${raj != null ? ' (rajadas até ' + r0(raj) + ' nós)' : ''}`,
    ondas: onda == null ? 'sem dados' : `até ${onda.toFixed(1)} m${per != null ? ' · ' + r0(per) + ' s' : ''}`,
    chuva: `${(precip ?? 0).toFixed(1)} mm${prob != null ? ' (até ' + r0(prob) + '%)' : ''}${trov ? ', com trovoadas' : ''}`,
    txt: `${veredito}${motivos.length ? ': ' + [...new Set(motivos)].join('; ') : ''}. ${extra.join(' ')}`
  };
}).filter(Boolean);

if (dias.length < 3) { console.error('::error::Menos de 3 dias completos. dados.json anterior mantido.'); process.exit(1); }

let antigo = {};
try { antigo = JSON.parse(await readFile(OUT, 'utf8')); } catch {}

const avaliado_em = new Date().toLocaleString('sv-SE', { timeZone: TZ }).replace(' ', 'T') + '-03:00';
const novo = { ...antigo, versao: antigo.versao || 1, avaliado_em, fonte: parcial ? 'open-meteo (modelos parciais)' : 'open-meteo (ECMWF + GFS, mais conservador)', dias };
await writeFile(OUT, JSON.stringify(novo, null, 2) + '\n');
console.log(`Gravado ${OUT}: ${dias.length} dias. CETESB mantida do boletim ${antigo.boletim_cetesb || '(nenhum)'}.`);