import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { avaliarDia } from './avaliar-dia.mjs';

/* Consistência DIA x HORA: o veredito do dia nunca pode ser mais otimista
   que o da hora para os MESMOS dados (segurança primeiro).
   Regra do dia: avaliar-dia.mjs. Regra da hora: bloco SEMAFORO do index.html.
   Este arquivo só MEDE. Os 4 testes marcados "DIVERGÊNCIA" falham de propósito
   até o passo 2c alinhar os limites (com CHANGELOG). */
const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const m = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
assert.ok(m, 'Marcadores SEMAFORO-INI/FIM não encontrados no index.html');
const { kayakV, surfV } = new Function(m[1] + ';return {kayakV,surfV}')();

/* dir 90 = vento do mar (não é terral), o caso mais exigente para o surfe */
const base = { vento: 5, raj: 8, onda: 0.5, per: 9, dir: 90 };

function compara(o = {}) {
  const x = { ...base, ...o };
  const dia = avaliarDia({
    vento: x.vento, raj: x.raj, precip: 0, prob: 10, trov: false,
    onda: x.onda, per: x.per, ondaMin: x.onda, ventoMin: x.vento, dir: x.dir
  });
  const h = { ws: x.vento, wg: x.raj, wd: x.dir, wh: x.onda, wp: x.per, rain: 0 };
  return { dia, k: kayakV(h).l, s: surfV(h).l };
}

const passos = (de, ate) =>
  Array.from({ length: Math.round((ate - de) * 10) + 1 }, (_, i) => Math.round((de + i / 10) * 10) / 10);

/* valores em que o DIA é mais otimista que a HORA (lista vazia = tudo certo) */
function otimistas(valores, campo, quem) {
  return valores.filter(v => {
    const r = compara({ [campo]: v });
    return r.dia[quem] < r[quem];
  });
}

// ---------- Controles (devem passar: provam que a comparação funciona) ----------
test('controle: dia calmo = hora calma (verde nos dois)', () => {
  const r = compara();
  assert.deepEqual([r.dia.k, r.k, r.dia.s, r.s], [0, 0, 0, 0]);
});

test('controle: vento 16 nós = vermelho no dia e na hora', () => {
  const r = compara({ vento: 16 });
  assert.deepEqual([r.dia.k, r.k, r.dia.s, r.s], [2, 2, 2, 2]);
});

// ---------- Divergências conhecidas (falham de propósito até o 2c) ----------
test('DIVERGÊNCIA 1: vento de 10,0 a 10,9 nós (dia verde, hora amarela)', () => {
  const v = passos(10.0, 10.9);
  assert.deepEqual(
    { caiaque: otimistas(v, 'vento', 'k'), surfe: otimistas(v, 'vento', 's') },
    { caiaque: [], surfe: [] }
  );
});

test('DIVERGÊNCIA 2: vento exato de 15 nós (dia amarelo, hora vermelha)', () => {
  assert.deepEqual(
    { caiaque: otimistas([15], 'vento', 'k'), surfe: otimistas([15], 'vento', 's') },
    { caiaque: [], surfe: [] }
  );
});

test('DIVERGÊNCIA 3: onda do surfe de 1,0 a 1,2 m (dia verde, hora amarela)', () => {
  assert.deepEqual(otimistas(passos(1.0, 1.2), 'onda', 's'), []);
});

test('DIVERGÊNCIA 4: onda do surfe de 1,5 a 1,8 m (dia amarelo, hora vermelha)', () => {
  assert.deepEqual(otimistas(passos(1.5, 1.8), 'onda', 's'), []);
});
