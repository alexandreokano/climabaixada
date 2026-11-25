import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tratarComoVazante } from './mare-tendencia.mjs';

// Regras do semáforo, extraídas do index.html (fonte única)
const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const m = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
assert.ok(m, 'Marcadores SEMAFORO-INI/FIM não encontrados no index.html');
const { kayakV } = new Function(m[1] + ';return {kayakV}')();

// Mesmo cálculo do tv() do index.html: estado tratado como vazante vira 'vazante'
const tv = t => t && { ...t, state: tratarComoVazante(t.state) ? 'vazante' : t.state };
const sul = { ws: 13, wg: 15, wd: 180, wh: 0.5, wp: 8, rain: 0 };
const k = (o, tide) => kayakV({ ...sul, ...o }, tv(tide));

test('cola: o index.html ainda liga o semáforo à regra de maré (tv e cons)', () => {
  assert.ok(html.includes("const cons=s=>TM?TM.tratarComoVazante(s):true"), 'linha cons mudou');
  assert.ok(html.includes("const tv=t=>t&&{...t,state:cons(t.state)?'vazante':t.state}"), 'linha tv mudou');
  assert.ok(html.includes('kayakV(oo,tv(t))'), 'hourInfo não passa mais pelo tv()');
  assert.ok(html.includes('state:estadoMare(ms)'), 'tideAt não usa mais estadoMare()');
});

test('vazante, estofa (parada) e indefinida + vento sul > 12 nós = 🔴 com aviso', () => {
  for (const state of ['vazante', 'parada', 'indefinida']) {
    const r = k({}, { state });
    assert.equal(r.l, 2, state);
    assert.equal(r.warn, true, state);
  }
});

test('sem tábua de maré (tide null) + vento sul > 12 nós = 🔴 com aviso', () => {
  const r = k({}, null);
  assert.equal(r.l, 2);
  assert.equal(r.warn, true);
});

test('enchente + vento sul > 12 nós não dispara o aviso do canal', () => {
  assert.equal(k({}, { state: 'enchente' }).warn, false);
});

test('limites: 12 nós e vento norte não disparam, mesmo na estofa', () => {
  assert.equal(k({ ws: 12 }, { state: 'parada' }).warn, false);
  assert.equal(k({ wd: 0 }, { state: 'parada' }).warn, false);
  assert.equal(k({ wd: 111 }, { state: 'parada' }).warn, false);
  assert.equal(k({ wd: 112 }, { state: 'parada' }).warn, true);
});
