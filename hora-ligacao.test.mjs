import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Lê o semáforo e a hourInfo REAIS do index.html (fonte única, sem duplicar regra)
const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const ms = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
const mh = html.match(/function hourInfo\(di,h\)\{[\s\S]*?\n\}/);
assert.ok(ms, 'Marcadores SEMAFORO-INI/FIM não encontrados no index.html');
assert.ok(mh, 'function hourInfo não encontrada no index.html');

// Só cria "num" de apoio se o bloco do semáforo não definir o seu (evita declarar duas vezes)
const temNum = /(const|let|var)\s+num\s*=|function\s+num\s*\(/.test(ms[1]);

// Monta a hourInfo real, trocando apenas as fontes de dados (clima, maré, bairro) por valores controlados
function monta(ctx) {
  return new Function('ctx', `
    const DAYS = ctx.DAYS;
    const cur = () => ({ m: ctx.sea });
    const obs = () => ctx.obs;
    const msAt = () => 0;
    const tideAt = () => ({ state: 'enchente', lvl: 1 });
    const inWin = () => false;
    const tv = t => t;
    ${temNum ? '' : 'const num = x => (typeof x === "number" && isFinite(x) ? x : null);'}
    ${ms[1]}
    ${mh[0]}
    return hourInfo;
  `)(ctx);
}

const base = { ws: 6, wg: 9, wd: 0, wh: 0.6, wp: 8, rain: 0 };
const hora = (dia, o = {}, sea = true) => monta({ DAYS: [dia], sea, obs: { ...base, ...o } })(0, 10);

test('ligação: sem veredito do dia, a hora 🟢 é 🟢 (controle do teste)', () => {
  const x = hora({ k: 0, s: 0 });
  assert.equal(x.k.l, 0);
  assert.equal(x.s.l, 0);
});

test('ligação: dia manual 🔴 → hora 🟢 vira 🔴 (caiaque e surfe) e explica o motivo', () => {
  const x = hora({ k: 2, s: 2 });
  assert.equal(x.k.l, 2);
  assert.equal(x.s.l, 2);
  assert.ok(x.k.r.some(t => t.includes('veredito do Capitão')));
  assert.ok(x.s.r.some(t => t.includes('veredito do Capitão')));
});

test('ligação: dia manual 🟡 → hora 🟢 sobe para 🟡; hora 🔴 continua 🔴', () => {
  assert.equal(hora({ k: 1, s: 1 }).k.l, 1);
  assert.equal(hora({ k: 1, s: 1 }).s.l, 1);
  const forte = hora({ k: 1, s: 1 }, { ws: 18, wg: 22 });
  assert.equal(forte.k.l, 2);
  assert.equal(forte.s.l, 2);
});

test('ligação: caiaque e surfe usam o veredito de cada um (k e s separados)', () => {
  const x = hora({ k: 2, s: 0 });
  assert.equal(x.k.l, 2);
  assert.equal(x.s.l, 0);
});

test('ligação: dia ⚪ (3) não muda a hora', () => {
  assert.equal(hora({ k: 3, s: 3 }).k.l, 0);
});

test('ligação: dia automático (auto) NÃO limita, porque o dia nasce das horas', () => {
  const x = hora({ auto: true, k: 2, s: 2 });
  assert.equal(x.k.l, 0);
  assert.equal(x.s.l, 0);
});

test('ligação: dia estendido (ext) NÃO limita', () => {
  const x = hora({ ext: true, k: 2, s: 2 });
  assert.equal(x.k.l, 0);
  assert.equal(x.s.l, 0);
});

test('ligação: bairro sem mar continua "sem dados" (nunca vira 🟢 nem 🔴 inventado)', () => {
  const x = hora({ k: 2, s: 2 }, {}, false);
  assert.equal(x.k.l, null);
  assert.equal(x.s.l, null);
});

test('ligação: dia inexistente não quebra e não limita', () => {
  const x = monta({ DAYS: [], sea: true, obs: base })(0, 10);
  assert.equal(x.k.l, 0);
});
