import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const m = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
assert.ok(m, 'Marcadores SEMAFORO-INI/FIM não encontrados no index.html');
const { nivelDoDia } = new Function(m[1] + ';return {nivelDoDia}')();

const dia = (k, s) => ({ k, s });
const OUTRAS = ['resumo', 'pesca', 'trafego', 'praia'];

test('cola: a tela das bolas usa nivelDoDia', () => {
  assert.ok(html.includes('EMO[nivelDoDia(d,S.sub)]'), 'a linha das bolas não chama nivelDoDia');
});

test('Resumão, Pesca, Navio e Praia: mostram o PIOR entre caiaque e surfe', () => {
  for (const sub of OUTRAS) {
    assert.equal(nivelDoDia(dia(0, 1), sub), 1, sub + ' k0 s1');
    assert.equal(nivelDoDia(dia(1, 0), sub), 1, sub + ' k1 s0');
    assert.equal(nivelDoDia(dia(0, 2), sub), 2, sub + ' k0 s2');
    assert.equal(nivelDoDia(dia(2, 0), sub), 2, sub + ' k2 s0');
    assert.equal(nivelDoDia(dia(0, 0), sub), 0, sub + ' k0 s0');
  }
});

test('Surf mostra só o surfe e Caiaque mostra só o caiaque', () => {
  assert.equal(nivelDoDia(dia(2, 0), 'surfe'), 0);
  assert.equal(nivelDoDia(dia(0, 2), 'surfe'), 2);
  assert.equal(nivelDoDia(dia(0, 2), 'caiaque'), 0);
  assert.equal(nivelDoDia(dia(2, 0), 'caiaque'), 2);
});

test('⚪ nunca vira "seguro"; 🔴 vence ⚪', () => {
  for (const sub of OUTRAS) {
    assert.equal(nivelDoDia(dia(3, 3), sub), 3);
    assert.equal(nivelDoDia(dia(2, 3), sub), 2);
    assert.equal(nivelDoDia(dia(3, 2), sub), 2);
    assert.equal(nivelDoDia(dia(0, 3), sub), 3);
    assert.equal(nivelDoDia(dia(3, 1), sub), 3);
  }
  assert.equal(nivelDoDia(dia(3, 0), 'surfe'), 0);
  assert.equal(nivelDoDia(dia(0, 3), 'surfe'), 3);
});

test('dado ausente ou inválido vira ⚪', () => {
  assert.equal(nivelDoDia(null, 'resumo'), 3);
  assert.equal(nivelDoDia(undefined, 'surfe'), 3);
  assert.equal(nivelDoDia({}, 'pesca'), 3);
  assert.equal(nivelDoDia(dia(0, 7), 'praia'), 3);
  assert.equal(nivelDoDia(dia(0, 0), undefined), 0);
});
