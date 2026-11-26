import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Extrai o bloco do semáforo direto do index.html (fonte única, sem duplicar regras)
const html = readFileSync(process.env.HTML || 'index.html', 'utf8');
const m = html.match(/\/\*SEMAFORO-INI\*\/([\s\S]*?)\/\*SEMAFORO-FIM\*\//);
assert.ok(m, 'Marcadores SEMAFORO-INI/FIM não encontrados no index.html');
const { kayakV, surfV, REGRAS, limitaJanela, limitaHora } = new Function(m[1] + ';return {kayakV,surfV,REGRAS,limitaJanela,limitaHora}')();

const base = { ws: 6, wg: 9, wd: 0, wh: 0.5, wp: 8, rain: 0 };
const k = (o, tide) => kayakV({ ...base, ...o }, tide);
const s = o => surfV({ ...base, ...o });

test('regras são imutáveis', () => assert.ok(Object.isFrozen(REGRAS)));

// ---------- Caiaque ----------
test('caiaque: condição ideal = verde', () => assert.equal(k({}).l, 0));
test('caiaque: limites do vento', () => {
  assert.equal(k({ ws: 10 }).l, 0);
  assert.equal(k({ ws: 11 }).l, 1);
  assert.equal(k({ ws: 14 }).l, 1);
  assert.equal(k({ ws: 15 }).l, 2);
});
test('caiaque: rajada > 20 = vermelho, mesmo com vento médio baixo', () => {
  assert.equal(k({ wg: 20 }).l, 0);
  assert.equal(k({ wg: 21 }).l, 2);
});
test('caiaque: limites da onda', () => {
  assert.equal(k({ wh: 0.8 }).l, 0);
  assert.equal(k({ wh: 0.9 }).l, 1);
  assert.equal(k({ wh: 1.0 }).l, 1);
  assert.equal(k({ wh: 1.1 }).l, 2);
});
test('caiaque: período curto só pesa com vento moderado', () => {
  assert.equal(k({ wp: 5, ws: 8 }).l, 0);
  assert.equal(k({ wp: 5, ws: 11 }).l, 1);
});
test('caiaque: chuva forte = amarelo', () => assert.equal(k({ rain: 1 }).l, 1));
test('caiaque: efeito canal (vazante + vento sul > 12 nós)', () => {
  const vz = { state: 'vazante' }, en = { state: 'enchente' };
  const r = k({ ws: 13, wd: 180 }, vz);
  assert.equal(r.l, 2); assert.equal(r.warn, true);
  assert.equal(k({ ws: 13, wd: 180 }, en).warn, false);
  assert.equal(k({ ws: 12, wd: 180 }, vz).warn, false);
  assert.equal(k({ ws: 13, wd: 0 }, vz).warn, false);
  assert.equal(k({ ws: 13, wd: 112 }, vz).warn, true);
  assert.equal(k({ ws: 13, wd: 111 }, vz).warn, false);
});
test('caiaque: sem dados = null; dado incompleto nunca é verde', () => {
  assert.equal(kayakV(null).l, null);
  assert.equal(kayakV({}).l, null);
  assert.equal(kayakV({ ws: NaN, wh: Infinity }).l, null);
  assert.ok(k({ ws: null }).l >= 1);
  assert.ok(k({ wh: null }).l >= 1);
});

// ---------- Surfe (iniciante) ----------
test('surfe: condição ideal = verde', () => assert.equal(s({ wh: 0.6 }).l, 0));
test('surfe: limites da onda', () => {
  assert.equal(s({ wh: 0.2 }).l, 1);
  assert.equal(s({ wh: 1.2 }).l, 1);
  assert.equal(s({ wh: 1.6 }).l, 2);
});
test('surfe: vento forte = vermelho; onshore pesa mais que terral', () => {
  assert.equal(s({ wh: 0.6, ws: 18, wd: 0 }).l, 2);
  assert.equal(s({ wh: 0.6, ws: 15, wd: 135 }).l, 2);
  assert.equal(s({ wh: 0.6, ws: 15, wd: 0 }).l, 0);
  assert.equal(s({ wh: 0.6, ws: 12, wd: 135 }).l, 1);
});
test('surfe: direção ausente NÃO é terral (regressão)', () => {
  assert.equal(s({ wh: 0.6, ws: 12, wd: null }).l, 1);
  assert.equal(s({ wh: 0.6, ws: 16, wd: null }).l, 2);
});
test('surfe: período curto e chuva = amarelo', () => {
  assert.equal(s({ wh: 0.6, wp: 5 }).l, 1);
  assert.equal(s({ wh: 0.6, rain: 2 }).l, 1);
});
test('surfe: sem dados = null; incompleto nunca é verde', () => {
  assert.equal(surfV(undefined).l, null);
  assert.ok(s({ wh: null }).l >= 1);
  assert.ok(s({ ws: null }).l >= 1);
});

// ---------- Trovoada e chance de chuva ----------
test('caiaque: trovoada (código >= 95) = vermelho', () => {
  assert.equal(k({ wc: 94 }).l, 0);
  assert.equal(k({ wc: 95 }).l, 2);
  assert.equal(k({ wc: 99 }).l, 2);
  assert.equal(k({ wc: 80 }).l, 0);
});
test('caiaque: trovoada na próxima hora = amarelo', () => assert.equal(k({ tsNext: true }).l, 1));
test('caiaque: chance de chuva >= 60% = amarelo', () => {
  assert.equal(k({ pp: 59 }).l, 0);
  assert.equal(k({ pp: 60 }).l, 1);
});
test('surfe: trovoada = vermelho; próxima hora e chance >= 60% = amarelo', () => {
  assert.equal(s({ wh: 0.6, wc: 95 }).l, 2);
  assert.equal(s({ wh: 0.6, tsNext: true }).l, 1);
  assert.equal(s({ wh: 0.6, pp: 59 }).l, 0);
  assert.equal(s({ wh: 0.6, pp: 60 }).l, 1);
});
test('wc/pp ausentes não mudam nada (regressão)', () => {
  assert.equal(k({ wc: null, pp: null }).l, 0);
  assert.equal(s({ wh: 0.6, wc: undefined, pp: null }).l, 0);
});

// ---------- Janela de horário x veredito do dia ----------
const jan = (l) => ({ l, txt: '08h às 10h' });
test('janela: dia 🔴 nunca mostra janela 🟢 ou 🟡', () => {
  assert.equal(limitaJanela(2, jan(0)).l, 2);
  assert.equal(limitaJanela(2, jan(1)).l, 2);
});
test('janela: nunca é mais otimista que o veredito, e não melhora o que já é pior', () => {
  assert.equal(limitaJanela(1, jan(0)).l, 1);
  assert.equal(limitaJanela(0, jan(0)).l, 0);
  assert.equal(limitaJanela(0, jan(1)).l, 1);
  assert.equal(limitaJanela(1, jan(2)).l, 2);
});
test('janela: ⚪, veredito inválido ou sem janela = sem janela; não altera o original', () => {
  assert.equal(limitaJanela(3, jan(0)), null);
  assert.equal(limitaJanela(undefined, jan(0)), null);
  assert.equal(limitaJanela(0, null), null);
  const w = jan(0);
  limitaJanela(2, w);
  assert.equal(w.l, 0);
});
test('janela: dia 🔴 nunca mostra horário de janela (regressão 22/11)', () => {
  assert.equal(limitaJanela(2, jan(0)).txt, 'nenhuma janela segura');
  assert.equal(limitaJanela(2, jan(1)).txt, 'nenhuma janela segura');
});
test('caiaque: sem tábua de maré (tide null) + vento sul > 12 nós = vermelho com aviso', () => {
  const r = k({ ws: 13, wd: 180 }, null);
  assert.equal(r.l, 2);
  assert.equal(r.warn, true);
  assert.equal(k({ ws: 12, wd: 180 }, null).warn, false);
  assert.equal(k({ ws: 13, wd: 0 }, null).warn, false);
  assert.equal(k({ ws: 13, wd: 180 }, { state: 'enchente' }).warn, false);
});

// ---------- Hora x veredito do dia ----------
const hora = (l) => ({ l, r: ['ondas 1.4 m: no limite'] });
test('hora: dia 🔴 nunca mostra hora 🟢 ou 🟡', () => {
  assert.equal(limitaHora(2, hora(0)).l, 2);
  assert.equal(limitaHora(2, hora(1)).l, 2);
  assert.equal(limitaHora(2, hora(2)).l, 2);
});
test('hora: dia 🟡 sobe hora 🟢 para 🟡 e nunca rebaixa', () => {
  assert.equal(limitaHora(1, hora(0)).l, 1);
  assert.equal(limitaHora(1, hora(1)).l, 1);
  assert.equal(limitaHora(1, hora(2)).l, 2);
});
test('hora: dia 🟢 não muda nada', () => {
  assert.equal(limitaHora(0, hora(0)).l, 0);
  assert.equal(limitaHora(0, hora(1)).l, 1);
});
test('hora: dia ⚪ ou inválido não muda; hora sem dados continua sem dados', () => {
  assert.equal(limitaHora(3, hora(0)).l, 0);
  assert.equal(limitaHora(undefined, hora(0)).l, 0);
  assert.equal(limitaHora(null, hora(0)).l, 0);
  assert.equal(limitaHora(2, hora(null)).l, null);
  assert.equal(limitaHora(2, null), null);
});
test('hora: explica o motivo e não altera o original', () => {
  const h = hora(0);
  const r = limitaHora(2, h);
  assert.ok(r.r.some(x => x.includes('veredito do Capitão')));
  assert.equal(h.l, 0);
  assert.equal(h.r.length, 1);
});

