// Regra única de vazante/enchente. Compara o último evento (até agora) com o
// PRÓXIMO evento que difira em pelo menos LIMIAR_M. Evita falso sentido em
// patamares quase iguais (oscilações de 1 a 3 cm).
export const LIMIAR_M = 0.10;   // diferença mínima para contar como subida/descida
export const HORIZ_H = 12;      // até quantas horas à frente procurar
export const LACUNA_H = 12;     // intervalo máximo aceito entre dois eventos (a DHN publica até ~10,8 h)

// estado: 'vazante' | 'enchente' | 'parada' | 'indefinida'
export function tendenciaMare(mares, agora = new Date(), limiar = LIMIAR_M) {
  const t = +agora;
  if (!Number.isFinite(t)) return { estado: 'indefinida', motivo: 'hora inválida' };

  const dia = k => new Date(t - 3 * 36e5 + k * 864e5).toISOString().slice(0, 10);
  const ev = [];
  for (let k = -1; k <= 2; k++) {
    const d = dia(k);
    const lista = mares && mares[d];
    if (!Array.isArray(lista)) continue;
    for (const e of lista) {
      if (!Array.isArray(e)) continue;
      const ms = Date.parse(`${d}T${e[0]}:00-03:00`);
      const v = e[2];
      // descarta evento com hora ou altura inválida (nunca deixar NaN decidir)
      if (Number.isFinite(ms) && typeof v === 'number' && Number.isFinite(v)) ev.push({ ms, v });
    }
  }
  ev.sort((a, b) => a.ms - b.ms);

  let i = -1;
  for (let k = 0; k < ev.length && ev[k].ms <= t; k++) i = k;
  if (i < 0 || i >= ev.length - 1) return { estado: 'indefinida', motivo: 'sem eventos ao redor' };
  const p = ev[i];
  if ((ev[i + 1].ms - p.ms) / 36e5 > LACUNA_H) return { estado: 'indefinida', motivo: 'lacuna na tábua' };

  for (let k = i + 1; k < ev.length; k++) {
    if ((ev[k].ms - t) / 36e5 > HORIZ_H) break;
    const dv = Math.round((ev[k].v - p.v) * 100) / 100;
    if (Math.abs(dv) >= limiar) return { estado: dv < 0 ? 'vazante' : 'enchente', ref: p, alvo: ev[k] };
  }
  if ((ev[ev.length - 1].ms - t) / 36e5 < HORIZ_H) return { estado: 'indefinida', motivo: 'tábua acaba antes do horizonte' };
  return { estado: 'parada' };
}

// Segurança primeiro: sem dado confiável, trate como vazante.
export const tratarComoVazante = est => est === 'vazante' || est === 'indefinida';
