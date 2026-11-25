import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const ini = html.indexOf('const PERIODO=');
const fim = html.indexOf('/*SEMAFORO-FIM*/');
if (ini < 0 || fim <= ini) throw new Error('Não achei const PERIODO= antes de /*SEMAFORO-FIM*/ no index.html');
const { chuvaCaicara: c, probTxt } = new Function(html.slice(ini, fim) + '\nreturn {chuvaCaicara,probTxt};')();

test('probTxt: limites 30, 50 e 80', () => {
  assert.equal(probTxt(29), 'duvido que caia');
  assert.equal(probTxt(30), 'pode ser que caia');
  assert.equal(probTxt(49), 'pode ser que caia');
  assert.equal(probTxt(50), 'tá armando chuva');
  assert.equal(probTxt(79), 'tá armando chuva');
  assert.equal(probTxt(80), 'pode contar que vem');
});

test('sem água relevante e sem ameaça = texto vazio', () => {
  assert.equal(c(0, null, false), '');
  assert.equal(c(0.29, null, false), '');
  assert.equal(c(0.29, 39, false), '');
  assert.equal(c(undefined, undefined, false), '');
  assert.equal(c(NaN, NaN, false), '');
  assert.equal(c(-1, null, false), '');
});

test('ameaça: chance >= 40% com pouca água', () => {
  assert.ok(c(0.1, 40, false).includes('Ameaça de chuva'));
  assert.ok(c(0.1, 40, false).includes('(40%)'));
  assert.equal(c(0.1, 39, false), '');
});

test('0,3 mm = garoinha com guarda-chuva pequeno (limite do card amarelo)', () => {
  const r = c(0.3, null, false);
  assert.ok(r.includes('garoinha'));
  assert.ok(r.includes('Guarda-chuva pequeno'));
  assert.ok(!r.includes('Nada que assuste'));
});

test('0,99 mm ainda é garoinha; 1 mm já pede capa (limite do card vermelho)', () => {
  assert.ok(c(0.99, null, false).includes('garoinha'));
  const r = c(1, null, false);
  assert.ok(r.includes('Chuvisqueiro'));
  assert.ok(r.includes('capa'));
  assert.ok(!r.includes('garoinha'));
});

test('chance >= 60% com >= 0,3 mm também é nível forte (igual ao card)', () => {
  const r = c(0.3, 60, false);
  assert.ok(r.includes('capa'));
  assert.ok(!r.includes('Guarda-chuva pequeno'));
  assert.ok(c(0.3, 59, false).includes('garoinha'));
});

test('faixas de volume: 5, 15 e 30 mm', () => {
  assert.ok(c(4.99, null, false).includes('Chuvisqueiro'));
  assert.ok(c(5, null, false).includes('pancada'));
  assert.ok(c(14.99, null, false).includes('pancada'));
  assert.ok(c(15, null, false).includes('Chuvarada'));
  assert.ok(c(29.99, null, false).includes('Chuvarada'));
  assert.ok(c(30, null, false).includes('Toró'));
});

test('não afirma estado do mar que a função não recebe', () => {
  const r = c(20, null, false);
  assert.ok(r.includes('pode ficar mexido'));
  assert.ok(!r.includes('vai ficar pesado'));
});

test('trovoada: alerta de raios sempre, mesmo sem chuva', () => {
  const sem = c(0, null, true);
  assert.ok(sem.includes('Risco de raios'));
  assert.ok(sem.includes('Não entre no mar'));
  assert.ok(!sem.includes('Chuva de'));
  assert.ok(c(0.3, null, true).includes('Chuva de ~0,3 mm'));
  assert.ok(c(0.29, null, true).includes('Risco de raios'));
});

test('horário e probabilidade só aparecem quando existem', () => {
  assert.ok(c(2, 90, false, 7, 18).includes('entre 07h e 18h'));
  assert.ok(!c(2, 90, false, null, null).includes('entre'));
  assert.ok(c(2, 90, false).includes('Pode contar que vem (90%)'));
  assert.ok(!c(2, null, false).includes('%'));
  assert.ok(!c(2, NaN, false).includes('%'));
});
