import test from 'node:test';
import assert from 'node:assert/strict';
import { tendenciaMare, tratarComoVazante } from './mare-tendencia.mjs';

const M = {
  '2027-01-01': [['03:32','B',0.68],['05:08','A',0.69],['06:47','B',0.68],['12:01','A',0.89],['16:08','B',0.52],['21:57','A',1.01]],
  '2027-01-07': [['02:38','A',1.27],['08:16','B',0.54],['15:02','A',1.24],['21:02','B',-0.02]],
  '2027-03-01': [['06:00','B',0.50],['09:00','A',0.55],['13:00','B',0.50],['17:00','A',0.56],['23:00','B',0.52]],
  '2027-03-02': [['06:00','A',0.78],['12:00','B',0.68],['18:00','A',0.90]],
};
const q = s => tendenciaMare(M, new Date(s + '-03:00')).estado;

test('maré achatada: último evento A mas a maré vai subir', () => assert.equal(q('2027-01-01T05:30:00'), 'enchente'));
test('vazante normal', () => assert.equal(q('2027-01-07T08:00:00'), 'vazante'));
test('enchente normal', () => assert.equal(q('2027-01-07T10:00:00'), 'enchente'));
test('vazante com negativa', () => assert.equal(q('2027-01-07T16:00:00'), 'vazante'));
test('parada', () => assert.equal(q('2027-03-01T07:00:00'), 'parada'));
test('limiar exato (0,10) conta', () => assert.equal(q('2027-03-02T07:00:00'), 'vazante'));
test('fora da tábua = indefinida = conservador', () => {
  const e = q('2030-01-01T10:00:00');
  assert.equal(e, 'indefinida');
  assert.ok(tratarComoVazante(e));
});
