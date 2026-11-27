/* Regra do dia (caiaque e surfe iniciante). Função pura: sem rede e sem arquivos.
   Mudou uma regra? Atualize avaliar-dia.test.mjs e registre a mudança no CHANGELOG.md.
   Níveis: 0 verde, 1 amarelo, 2 vermelho. Vento e rajada em nós, onda em m, período em s, chuva em mm. */
export function avaliarDia({ vento, raj, precip, prob, trov, onda, per, ondaMin, ventoMin, dir }) {
  const sul = dir != null && dir > 100 && dir < 260;
  const motivos = [];

  // ----- Caiaque
  let k = 0;
  if (vento != null) {
    if (vento > 15 || (raj != null && raj > 20)) { k = 2; motivos.push('vento/rajadas acima do limite do caiaque'); }
    else if (vento >= 11 || (raj != null && raj > 15)) { k = Math.max(k, 1); motivos.push('vento moderado ou rajadas'); }
  }
  if (onda != null) {
    if (onda > 1.0) { k = 2; motivos.push('ondas acima de 1,0 m'); }
    else if (onda >= 0.8) { k = Math.max(k, 1); motivos.push('ondas de até ' + onda.toFixed(1).replace('.', ',') + ' m, perto do limite de 1,0 m'); }
  }
  if (per != null && per < 6 && vento >= 8) { k = Math.max(k, 1); motivos.push('mar curto e batido'); }
  if (trov || (precip != null && precip >= 10)) { k = 2; motivos.push('risco de trovoadas ou chuva forte'); }
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) { k = Math.max(k, 1); motivos.push('pancadas de chuva'); }

  // ----- Surfe iniciante
  let s = 0;
  if (onda != null && onda < 0.4) { s = 1; }
  if (onda != null && onda > 1.2) s = Math.max(s, 1);
  if (onda != null && onda > 1.8) s = 2;
  if (vento != null && vento > 15) s = 2;
  else if (vento != null && vento >= 11) s = Math.max(s, 1);
  if (trov || (precip != null && precip >= 10)) s = 2;
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) s = Math.max(s, 1);

  const diverge = (onda != null && ondaMin != null && onda - ondaMin > 0.3) || (vento != null && ventoMin != null && vento - ventoMin > 4);
  return { k, s, motivos, sul, diverge };
}
