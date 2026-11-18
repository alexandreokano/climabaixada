import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Extrai o bloco do semáforo direto do index.html (fonte única, sem duplicar regras)
const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const m = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
assert.ok(m, 'Marcadores SEMAFORO-INI/FIM não encontrados no index.html');
const { kayakV, surfV, REGRAS } = new Function(m[1] + ';return {kayakV,surfV,REGRAS}')();

const base = { ws: 6, wg: 9, wd: 0, wh: 0.5, wp: 8, rain: 0 };
const k = (o, tide) => kayakV({ ...base, ...o }, tide);
const s = o => surfV({ ...base, ...o });

test('regras são imutáveis', () => assert.ok(Object.isFrozen(REGRAS)));

// ---------- Caiaque ----------
test('caiaque: condição ideal = verde', () => assert.equal(k({}).l, 0));
test('caiaque: limites do vento', () => {
  assert.equal(k({ ws: 10 }).l, 0);
  assert.equal(k({ ws: 11 }).l, 1);
  assert.equal(k({ ws: 14 }).l, 1);
  assert.equal(k({ ws: 15 }).l, 2);
});
test('caiaque: rajada > 20 = vermelho, mesmo com vento médio baixo', () => {
  assert.equal(k({ wg: 20 }).l, 0);
  assert.equal(k({ wg: 21 }).l, 2);
});
test('caiaque: limites da onda', () => {
  assert.equal(k({ wh: 0.8 }).l, 0);
  assert.equal(k({ wh: 0.9 }).l, 1);
  assert.equal(k({ wh: 1.0 }).l, 1);
  assert.equal(k({ wh: 1.1 }).l, 2);
});
test('caiaque: período curto só pesa com vento moderado', () => {
  assert.equal(k({ wp: 5, ws: 8 }).l, 0);
  assert.equal(k({ wp: 5, ws: 11 }).l, 1);
});
test('caiaque: chuva forte = amarelo', () => assert.equal(k({ rain: 1 }).l, 1));
test('caiaque: efeito canal (vazante + vento sul > 12 nós)', () => {
  const vz = { state: 'vazante' }, en = { state: 'enchente' };
  const r = k({ ws: 13, wd: 180 }, vz);
  assert.equal(r.l, 2); assert.equal(r.warn, true);
  assert.equal(k({ ws: 13, wd: 180 }, en).warn, false);
  assert.equal(k({ ws: 12, wd: 180 }, vz).warn, false);
  assert.equal(k({ ws: 13, wd: 0 }, vz).warn, false);
  assert.equal(k({ ws: 13, wd: 112 }, vz).warn, true);
  assert.equal(k({ ws: 13, wd: 111 }, vz).warn, false);
});
test('caiaque: sem dados = null; dado incompleto nunca é verde', () => {
  assert.equal(kayakV(null).l, null);
  assert.equal(kayakV({}).l, null);
  assert.equal(kayakV({ ws: NaN, wh: Infinity }).l, null);
  assert.ok(k({ ws: null }).l >= 1);
  assert.ok(k({ wh: null }).l >= 1);
});

// ---------- Surfe (iniciante) ----------
test('surfe: condição ideal = verde', () => assert.equal(s({ wh: 0.6 }).l, 0));
test('surfe: limites da onda', () => {
  assert.equal(s({ wh: 0.2 }).l, 1);
  assert.equal(s({ wh: 1.2 }).l, 1);
  assert.equal(s({ wh: 1.6 }).l, 2);
});
test('surfe: vento forte = vermelho; onshore pesa mais que terral', () => {
  assert.equal(s({ wh: 0.6, ws: 18, wd: 0 }).l, 2);
  assert.equal(s({ wh: 0.6, ws: 15, wd: 135 }).l, 2);
  assert.equal(s({ wh: 0.6, ws: 15, wd: 0 }).l, 0);
  assert.equal(s({ wh: 0.6, ws: 12, wd: 135 }).l, 1);
});
test('surfe: direção ausente NÃO é terral (regressão)', () => {
  assert.equal(s({ wh: 0.6, ws: 12, wd: null }).l, 1);
  assert.equal(s({ wh: 0.6, ws: 16, wd: null }).l, 2);
});
test('surfe: período curto e chuva = amarelo', () => {
  assert.equal(s({ wh: 0.6, wp: 5 }).l, 1);
  assert.equal(s({ wh: 0.6, rain: 2 }).l, 1);
});
test('surfe: sem dados = null; incompleto nunca é verde', () => {
  assert.equal(surfV(undefined).l, null);
  assert.ok(s({ wh: null }).l >= 1);
  assert.ok(s({ ws: null }).l >= 1);
});
