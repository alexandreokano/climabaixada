import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('./gerar-dados.mjs', import.meta.url), 'utf8');

test('cola: gerar-dados.mjs lê vermelhos de avaliarDia e grava no dia', () => {
  assert.match(src, /const \{[^}]*\bvermelhos\b[^}]*\} = avaliarDia\(/);
  assert.match(src, /date, lbl, k, s, vermelhos,/);
});
