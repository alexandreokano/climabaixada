import { readFile, writeFile } from 'node:fs/promises';

const OUT = process.env.OUT || 'noticias.json';
const UA = 'Mozilla/5.0 (compatible; ClimaBaixadaBot/1.0; +https://climabaixada.com.br/)';
const YT = id => 'https://www.youtube.com/feeds/videos.xml?channel_id=' + id;

// max = quantos itens guardar por fonte; bloqueia = URLs que não valem como notícia
const SOURCES = [
  { fonte: 'Diário do Peixe', base: 'https://www.diariodopeixe.com.br/', max: 6,
    bloqueia: /\/colunas\//i,
    rss: 'https://www.diariodopeixe.com.br/noticias/feed/',
    html: 'https://www.diariodopeixe.com.br/noticias/' },
  { fonte: 'Santos FC (YouTube)', base: 'https://www.youtube.com/', max: 3,
    rss: YT('UC0uRT_armQXqds_rjTjqJ0g') },
  { fonte: 'De Olho no Peixe (YouTube)', base: 'https://www.youtube.com/', max: 3,
    rss: YT('UCL_RLyuLhW-pvDb8a7cIhWw') },
  { fonte: 'Diário do Peixe (YouTube)', base: 'https://www.youtube.com/', max: 3,
    rss: YT('UC-6BRAVobi7q0paklYjgW3Q') }
];

async function get(url) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), 15000);
  try {
    const r = await fetch(url, { signal: c.signal, redirect: 'follow', headers: { 'user-agent': UA, accept: '*/*' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.text();
  } finally { clearTimeout(t); }
}

const decode = s => String(s || '')
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();

const fmtDate = d => {
  const x = new Date(d);
  return isNaN(x) ? '' : x.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
};

const okUrl = (u, s) => {
  try {
    const a = new URL(u), b = new URL(s.base);
    return a.protocol === 'https:' && a.hostname === b.hostname && !(s.bloqueia && s.bloqueia.test(a.pathname));
  } catch { return false; }
};

// Lê RSS (<item>) e Atom (<entry>, usado pelo YouTube)
function fromRss(xml) {
  const tag = (s, n) => { const m = s.match(new RegExp('<' + n + '[^>]*>([\\s\\S]*?)</' + n + '>')); return m ? decode(m[1]) : ''; };
  if (/<entry[\s>]/.test(xml)) {
    return [...xml.matchAll(/<entry[\s>][\s\S]*?<\/entry>/g)].map(m => {
      const l = m[0].match(/<link[^>]*href="([^"]+)"/);
      return { titulo: tag(m[0], 'title'), url: l ? l[1] : '', data: fmtDate(tag(m[0], 'published')) };
    });
  }
  return [...xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)].map(m => ({
    titulo: tag(m[0], 'title'), url: tag(m[0], 'link'), data: fmtDate(tag(m[0], 'pubDate'))
  }));
}

const RUIM = /\/(tag|tags|category|categoria|categorias|author|autor|page|wp-content|wp-json|feed|login|contato|sobre|privacidade|politica)(\/|$)/i;
function fromHtml(html, pageUrl) {
  const out = [];
  for (const m of html.matchAll(/<a\s[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let u;
    try { u = new URL(m[1], pageUrl); } catch { continue; }
    u.hash = ''; u.search = '';
    const titulo = decode(m[2]);
    if (titulo.length < 25 || titulo.length > 220) continue;
    if (u.pathname === '/' || u.href === new URL(pageUrl).href || RUIM.test(u.pathname)) continue;
    out.push({ titulo, url: u.href, data: '' });
  }
  return out;
}

function limpar(lista, s) {
  const vistos = new Set(), res = [];
  for (const i of lista) {
    if (!i.titulo || !okUrl(i.url, s) || vistos.has(i.url)) continue;
    vistos.add(i.url);
    res.push({ fonte: s.fonte, titulo: i.titulo, url: i.url, data: i.data || '' });
    if (res.length >= s.max) break;
  }
  return res;
}

async function buscar(s) {
  const tentativas = [
    s.rss && (async () => fromRss(await get(s.rss))),
    s.html && (async () => fromHtml(await get(s.html), s.html))
  ].filter(Boolean);
  for (const t of tentativas) {
    try {
      const itens = limpar(await t(), s);
      if (itens.length) return itens;
    } catch (e) { console.warn('::warning::' + s.fonte + ': ' + e.message); }
  }
  return [];
}

let antigo = { itens: [] };
try { antigo = JSON.parse(await readFile(OUT, 'utf8')); } catch {}
if (!Array.isArray(antigo.itens)) antigo.itens = [];

let itens = [], falhas = 0;
for (const s of SOURCES) {
  let novos = await buscar(s);
  if (!novos.length) {
    falhas++;
    novos = antigo.itens.filter(i => i && i.fonte === s.fonte && okUrl(i.url, s)).slice(0, s.max);
    console.warn('::warning::Sem manchetes novas de ' + s.fonte + '; mantendo as anteriores (' + novos.length + ').');
  }
  itens.push(...novos);
}

if (!itens.length) { console.error('Nenhuma manchete obtida e nenhuma anterior guardada.'); process.exit(1); }
if (falhas === SOURCES.length) { console.error('Todas as fontes falharam.'); process.exit(1); }

if (JSON.stringify(itens) === JSON.stringify(antigo.itens)) { console.log('Sem mudanças.'); process.exit(0); }

const atualizado_em = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' });
await writeFile(OUT, JSON.stringify({ atualizado_em, itens }, null, 2) + '\n');
console.log('Gravado ' + OUT + ' com ' + itens.length + ' manchetes.');