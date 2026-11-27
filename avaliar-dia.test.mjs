import test from 'node:test';
import assert from 'node:assert/strict';
import { avaliarDia } from './avaliar-dia.mjs';

/* Testes de TRAVAMENTO: provam que a regra do dia continua igual à que já rodava.
   Os casos marcados "hoje" documentam limites que divergem do REGRAS do index.html.
   Eles serão tratados no passo 2c, com teste novo e CHANGELOG. */
const base = { vento: 5, raj: 8, precip: 0, prob: 10, trov: false, onda: 0.5, per: 9, ondaMin: 0.5, ventoMin: 5, dir: 90 };
const dia = (o = {}) => avaliarDia({ ...base, ...o });
const ks = r => [r.k, r.s];

test('dia calmo é verde para caiaque e surfe', () => {
  const r = dia();
  assert.deepEqual(ks(r), [0, 0]);
  assert.deepEqual(r.motivos, []);
});

test('vento: 10,0 nós é verde; acima de 10 já é amarelo (igual à hora)', () => {
  assert.deepEqual(ks(dia({ vento: 10, ventoMin: 10 })), [0, 0]);
  assert.deepEqual(ks(dia({ vento: 10.5, ventoMin: 10.5 })), [1, 1]);
});

test('vento 11 nós: amarelo nos dois', () => {
  assert.deepEqual(ks(dia({ vento: 11, ventoMin: 11 })), [1, 1]);
});

test('vento: 14,9 nós é amarelo; 15 nós cravados já é vermelho (igual à hora)', () => {
  assert.deepEqual(ks(dia({ vento: 14.9, ventoMin: 14.9 })), [1, 1]);
  assert.deepEqual(ks(dia({ vento: 15, ventoMin: 15 })), [2, 2]);
});

test('vento 16 nós: vermelho nos dois', () => {
  assert.deepEqual(ks(dia({ vento: 16, ventoMin: 16 })), [2, 2]);
});

test('rajada: 21 nós é vermelho no caiaque; 16 nós é amarelo', () => {
  assert.deepEqual(ks(dia({ vento: 8, ventoMin: 8, raj: 21 })), [2, 0]);
  assert.deepEqual(ks(dia({ vento: 8, ventoMin: 8, raj: 16 })), [1, 0]);
});

test('onda 0,8 e 1,0 m: amarelo no caiaque, surfe verde', () => {
  assert.deepEqual(ks(dia({ onda: 0.8, ondaMin: 0.8 })), [1, 0]);
  assert.deepEqual(ks(dia({ onda: 1.0, ondaMin: 1.0 })), [1, 0]);
});

test('onda 1,1 m: caiaque vermelho, surfe verde (hoje; a hora do surfe já é amarela)', () => {
  assert.deepEqual(ks(dia({ onda: 1.1, ondaMin: 1.1 })), [2, 0]);
});

test('onda 1,6 e 1,8 m: surfe amarelo; 1,9 m: surfe vermelho (hoje; a hora fica vermelha acima de 1,5)', () => {
  assert.deepEqual(ks(dia({ onda: 1.6, ondaMin: 1.6 })), [2, 1]);
  assert.deepEqual(ks(dia({ onda: 1.8, ondaMin: 1.8 })), [2, 1]);
  assert.deepEqual(ks(dia({ onda: 1.9, ondaMin: 1.9 })), [2, 2]);
});

test('onda 0,3 m: surfe amarelo (mar pequeno), caiaque verde', () => {
  assert.deepEqual(ks(dia({ onda: 0.3, ondaMin: 0.3 })), [0, 1]);
});

test('mar curto (período < 6 s) com vento >= 8 nós: caiaque amarelo; com vento 7: verde', () => {
  const a = dia({ per: 5, vento: 8, ventoMin: 8 });
  assert.deepEqual(ks(a), [1, 0]);
  assert.ok(a.motivos.includes('mar curto e batido'));
  assert.deepEqual(ks(dia({ per: 5, vento: 7, ventoMin: 7 })), [0, 0]);
});

test('chuva e trovoada', () => {
  const a = dia({ precip: 10 });
  assert.deepEqual(ks(a), [2, 2]);
  assert.deepEqual(a.motivos, ['risco de trovoadas ou chuva forte']);
  const b = dia({ precip: 2 });
  assert.deepEqual(ks(b), [1, 1]);
  assert.deepEqual(b.motivos, ['pancadas de chuva']);
  assert.deepEqual(ks(dia({ prob: 60 })), [1, 1]);
  assert.deepEqual(ks(dia({ precip: 1.9, prob: 59 })), [0, 0]);
  assert.deepEqual(ks(dia({ trov: true })), [2, 2]);
});

test('direção sul: de 101 a 259 graus (100 e 260 ficam de fora)', () => {
  assert.equal(dia({ dir: 180 }).sul, true);
  assert.equal(dia({ dir: 101 }).sul, true);
  assert.equal(dia({ dir: 100 }).sul, false);
  assert.equal(dia({ dir: 260 }).sul, false);
  assert.equal(dia({ dir: null }).sul, false);
});

test('modelos divergem: onda > 0,3 m ou vento > 4 nós de diferença', () => {
  assert.equal(dia({ onda: 1.0, ondaMin: 0.5 }).diverge, true);
  assert.equal(dia({ onda: 1.0, ondaMin: 0.8 }).diverge, false);
  assert.equal(dia({ vento: 10, ventoMin: 5 }).diverge, true);
  assert.equal(dia({ vento: 10, ventoMin: 6 }).diverge, false);
});

test('motivos saem na ordem: vento, onda, chuva', () => {
  const r = dia({ vento: 16, ventoMin: 16, onda: 1.2, ondaMin: 1.2, precip: 12 });
  assert.deepEqual(r.motivos, [
    'vento/rajadas acima do limite do caiaque',
    'ondas acima de 1,0 m',
    'risco de trovoadas ou chuva forte'
  ]);
});
