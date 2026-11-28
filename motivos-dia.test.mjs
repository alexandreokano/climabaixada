import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const m = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
assert.ok(m, 'Marcadores SEMAFORO-INI/FIM não encontrados no index.html');
const { motivosVermelhos } = new Function(
  m[1] + ';return {motivosVermelhos: typeof motivosVermelhos==="function"?motivosVermelhos:undefined}'
)();

const OND = 'ondas de 1,98 m (limite: 1 m)';
const CHU = 'chuva de 18 mm no dia (limite: 10 mm)';
const dia = (o = {}) => ({ k: 2, s: 2, vermelhos: { k: [OND, CHU], s: [CHU] }, ...o });
const OUTRAS = ['resumo', 'pesca', 'trafego', 'praia'];

test('Surf mostra só os motivos do surfe; Caiaque só os do caiaque', () => {
  assert.deepEqual(motivosVermelhos(dia(), 'surfe'), [CHU]);
  assert.deepEqual(motivosVermelhos(dia(), 'caiaque'), [OND, CHU]);
});

test('outras abas juntam caiaque e surfe, sem repetir, caiaque primeiro', () => {
  for (const sub of OUTRAS) assert.deepEqual(motivosVermelhos(dia(), sub), [OND, CHU], sub);
});

test('atividade que não é 🔴 não mostra motivo, mesmo que o campo tenha texto', () => {
  const d = dia({ s: 1, vermelhos: { k: [OND], s: ['texto velho'] } });
  assert.deepEqual(motivosVermelhos(d, 'surfe'), []);
  assert.deepEqual(motivosVermelhos(d, 'resumo'), [OND]);
  assert.deepEqual(motivosVermelhos(dia({ k: 0, s: 0 }), 'resumo'), []);
});

test('dia auto ou ext nunca mostra motivo (avaliação vencida)', () => {
  assert.deepEqual(motivosVermelhos(dia({ auto: 1 }), 'caiaque'), []);
  assert.deepEqual(motivosVermelhos(dia({ ext: 1 }), 'resumo'), []);
  assert.deepEqual(motivosVermelhos(dia({ k: 3, s: 3, auto: 1 }), 'resumo'), []);
});

test('campo ausente ou inválido vira lista vazia, sem inventar', () => {
  for (const v of [undefined, null, 'x', 5, [], {}, { k: 'x', s: 7 }, { k: null }])
    assert.deepEqual(motivosVermelhos(dia({ vermelhos: v }), 'resumo'), [], JSON.stringify(v));
  assert.deepEqual(motivosVermelhos(null, 'resumo'), []);
  assert.deepEqual(motivosVermelhos(undefined, 'surfe'), []);
});

test('itens que não são texto, ou são vazios, são descartados', () => {
  const d = dia({ vermelhos: { k: [OND, '', '   ', 5, null, {}, CHU], s: [] } });
  assert.deepEqual(motivosVermelhos(d, 'caiaque'), [OND, CHU]);
});
