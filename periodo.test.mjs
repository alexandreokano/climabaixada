import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const ini = html.indexOf('const PERIODO=');
const fim = html.indexOf('/*SEMAFORO-FIM*/');
if (ini < 0 || fim <= ini) throw new Error('Não achei const PERIODO= antes de /*SEMAFORO-FIM*/ no index.html');
const { PERIODO, periodoInfo } = new Function(html.slice(ini, fim) + '\nreturn {PERIODO,periodoInfo};')();

const tem = (r, txt) => r.dicas.some(d => d.includes(txt));

test('periodo: sem hora com temperatura válida = null', () => {
  assert.equal(periodoInfo([], 'manha'), null);
  assert.equal(periodoInfo(null, 'manha'), null);
  assert.equal(periodoInfo(undefined, 'manha'), null);
  assert.equal(periodoInfo([{ pp: 10 }], 'manha'), null);
  assert.equal(periodoInfo([null], 'manha'), null);
  assert.equal(periodoInfo([{ tp: '25' }], 'manha'), null);
});

test('periodo: dia seco = verde, sem chuva', () => {
  const r = periodoInfo([{ tp: 26, pp: 10, rain: 0, wg: 10 }], 'noite');
  assert.equal(r.chuva, 'improvavel');
  assert.equal(r.l, 0);
  assert.equal(r.rm, 0);
  assert.equal(r.pm, 10);
  assert.equal(r.tmin, 26);
  assert.equal(r.tmax, 26);
  assert.equal(r.dicas.length, 1);
  assert.ok(tem(r, 'deixar em casa'));
});

test('periodo: chuva forte por volume (soma das horas >= 1 mm)', () => {
  const r = periodoInfo([{ tp: 25, pp: 20, rain: 0.6 }, { tp: 25, pp: 20, rain: 0.5 }], 'tarde');
  assert.equal(r.chuva, 'forte');
  assert.equal(r.l, 2);
});

test('periodo: chuva forte por chance >= 60% com pelo menos 0,3 mm', () => {
  const r = periodoInfo([{ tp: 25, pp: 60, rain: 0.3 }], 'tarde');
  assert.equal(r.chuva, 'forte');
  assert.equal(r.l, 2);
});

test('periodo: chance alta com quase nada de água = fraca, nunca verde', () => {
  const r = periodoInfo([{ tp: 25, pp: 60, rain: 0.1 }], 'tarde');
  assert.equal(r.chuva, 'fraca');
  assert.equal(r.l, 1);
});

test('periodo: 0,3 mm = fraca (limite)', () => {
  const r = periodoInfo([{ tp: 25, pp: 10, rain: 0.3 }], 'tarde');
  assert.equal(r.chuva, 'fraca');
  assert.equal(r.l, 1);
});

test('periodo: chance 40% = fraca; 39% = improvável (limite)', () => {
  assert.equal(periodoInfo([{ tp: 25, pp: 40, rain: 0 }], 'tarde').chuva, 'fraca');
  assert.equal(periodoInfo([{ tp: 25, pp: 40, rain: 0 }], 'tarde').l, 1);
  assert.equal(periodoInfo([{ tp: 25, pp: 39, rain: 0 }], 'tarde').chuva, 'improvavel');
  assert.equal(periodoInfo([{ tp: 25, pp: 39, rain: 0 }], 'tarde').l, 0);
});

test('periodo: sem chance de chuva informada = ⚪, nunca verde; com água prevista vira fraca', () => {
  const r = periodoInfo([{ tp: 25, rain: 0 }], 'tarde');
  assert.equal(r.chuva, 'semdado');
  assert.equal(r.l, 3);
  assert.equal(r.pm, null);
  assert.ok(tem(r, 'Sem chance de chuva informada'));
  const c = periodoInfo([{ tp: 25, rain: 0.5 }], 'tarde');
  assert.equal(c.chuva, 'fraca');
  assert.equal(c.l, 1);
});

test('periodo: rajada >= 45 km/h = amarelo, e nunca piora para menos que a chuva', () => {
  const alta = periodoInfo([{ tp: 25, pp: 10, rain: 0, wg: 25 }], 'tarde');
  assert.ok(Math.abs(alta.gkmh - 46.3) < 0.01);
  assert.equal(alta.l, 1);
  assert.ok(tem(alta, 'Rajadas fortes'));
  const baixa = periodoInfo([{ tp: 25, pp: 10, rain: 0, wg: 24 }], 'tarde');
  assert.equal(baixa.l, 0);
  assert.ok(!tem(baixa, 'Rajadas fortes'));
  const forte = periodoInfo([{ tp: 25, pp: 80, rain: 2, wg: 30 }], 'tarde');
  assert.equal(forte.l, 2);
});

test('periodo: blusa quando a mínima é <= 23 °C', () => {
  assert.ok(tem(periodoInfo([{ tp: 23, pp: 10, rain: 0 }], 'noite'), 'blusa'));
  assert.ok(!tem(periodoInfo([{ tp: 24, pp: 10, rain: 0 }], 'noite'), 'blusa'));
});

test('periodo: protetor só de dia e com calor >= 30 °C (sensação vale mais que a temperatura)', () => {
  assert.ok(tem(periodoInfo([{ tp: 25, ap: 30, pp: 10, rain: 0 }], 'tarde'), 'Protetor'));
  assert.ok(!tem(periodoInfo([{ tp: 25, ap: 30, pp: 10, rain: 0 }], 'noite'), 'Protetor'));
  assert.ok(!tem(periodoInfo([{ tp: 29.9, pp: 10, rain: 0 }], 'almoco'), 'Protetor'));
  assert.ok(tem(periodoInfo([{ tp: 30, pp: 10, rain: 0 }], 'manha'), 'Protetor'));
});

test('periodo: valores não numéricos são ignorados, nunca viram "seguro"', () => {
  const a = periodoInfo([{ tp: 25, pp: NaN, rain: 0 }], 'tarde');
  assert.equal(a.chuva, 'semdado');
  assert.equal(a.l, 3);
  const b = periodoInfo([{ tp: 25, pp: 10, rain: 'x', wg: Infinity }], 'tarde');
  assert.equal(b.rm, 0);
  assert.equal(b.gkmh, null);
  assert.equal(b.l, 0);
});

test('periodo: limites são imutáveis e têm os valores combinados', () => {
  assert.ok(Object.isFrozen(PERIODO));
  assert.ok(Object.isFrozen(PERIODO.SOL));
  assert.equal(PERIODO.FORTE_MM, 1);
  assert.equal(PERIODO.FORTE_PP, 60);
  assert.equal(PERIODO.FORTE_PP_MM, 0.3);
  assert.equal(PERIODO.FRACA_MM, 0.3);
  assert.equal(PERIODO.FRACA_PP, 40);
  assert.equal(PERIODO.RAJADA_KMH, 45);
  assert.equal(PERIODO.BLUSA_C, 23);
  assert.equal(PERIODO.CALOR_C, 30);
});
