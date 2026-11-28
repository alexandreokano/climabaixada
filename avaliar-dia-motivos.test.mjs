import test from 'node:test';
import assert from 'node:assert/strict';
import { avaliarDia } from './avaliar-dia.mjs';

const base = { vento: 5, raj: 8, precip: 0, prob: 10, trov: false, onda: 0.5, per: 9, ondaMin: 0.5, ventoMin: 5, dir: 90 };
const dia = (o = {}) => avaliarDia({ ...base, ...o });

test('dia calmo: nenhum motivo de 🔴', () => {
  const r = dia();
  assert.deepEqual(r.vermelhos, { k: [], s: [] });
});

test('o motivo nunca contradiz a cor: 🔴 se e somente se há motivo (3360 combinações)', () => {
  const V = [null, 5, 10, 10.5, 14.9, 15, 16];
  const R = [null, 15, 20, 20.5, 25];
  const O = [null, 0.3, 0.8, 1.0, 1.04, 1.5, 1.6, 2];
  const P = [null, 0, 2, 9.9, 10, 30];
  for (const vento of V) for (const raj of R) for (const onda of O) for (const precip of P) for (const trov of [false, true]) {
    const r = dia({ vento, raj, onda, precip, trov });
    const id = JSON.stringify({ vento, raj, onda, precip, trov });
    assert.equal(r.k === 2, r.vermelhos.k.length > 0, 'caiaque ' + id);
    assert.equal(r.s === 2, r.vermelhos.s.length > 0, 'surfe ' + id);
  }
});

test('caiaque: lista TODOS os motivos, com valor e limite, na ordem vento, rajada, onda, chuva', () => {
  const r = dia({ vento: 16, raj: 25, onda: 1.2, precip: 28.6 });
  assert.deepEqual(r.vermelhos.k, [
    'vento de 16 nós (limite: 15)',
    'rajadas de 25 nós (limite: 20)',
    'ondas de 1,2 m (limite: 1 m)',
    'chuva de 28,6 mm no dia (limite: 10 mm)'
  ]);
});

test('surfe: ondas, vento e chuva, cada um com seu limite', () => {
  assert.deepEqual(dia({ onda: 2 }).vermelhos.s, ['ondas de 2 m (limite: 1,5 m)']);
  assert.deepEqual(dia({ vento: 16, onda: 1.2, precip: 28.6 }).vermelhos.s, [
    'vento de 16 nós (limite: 15)',
    'chuva de 28,6 mm no dia (limite: 10 mm)'
  ]);
});

test('rajada só pesa no caiaque; o surfe não cita rajada', () => {
  const r = dia({ vento: 8, raj: 25 });
  assert.equal(r.k, 2);
  assert.deepEqual(r.vermelhos.k, ['rajadas de 25 nós (limite: 20)']);
  assert.equal(r.s, 0);
  assert.deepEqual(r.vermelhos.s, []);
});

test('trovoada e decimais', () => {
  assert.deepEqual(dia({ trov: true }).vermelhos, { k: ['trovoada prevista'], s: ['trovoada prevista'] });
  assert.deepEqual(dia({ onda: 1.04 }).vermelhos.k, ['ondas de 1,04 m (limite: 1 m)']);
});
