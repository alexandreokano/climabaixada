/* Regra do dia (caiaque e surfe iniciante). Função pura: sem rede e sem arquivos.
   Mudou uma regra? Atualize avaliar-dia.test.mjs e registre a mudança no CHANGELOG.md.
   Níveis: 0 verde, 1 amarelo, 2 vermelho. Vento e rajada em nós, onda em m, período em s, chuva em mm.
   `vermelhos` lista, por atividade, o que causou o 🔴 (valor e limite). Sai das MESMAS condições que definem a cor. */
export function avaliarDia({ vento, raj, precip, prob, trov, onda, per, ondaMin, ventoMin, dir }) {
  const sul = dir != null && dir > 100 && dir < 260;
  const motivos = [];
  const vermelhos = { k: [], s: [] };
  const fmt = n => String(Math.round(n * 100) / 100).replace('.', ',');

  // ----- Caiaque
  let k = 0;
  if (vento != null) {
    if (vento >= 15 || (raj != null && raj > 20)) {
      k = 2; motivos.push('vento/rajadas acima do limite do caiaque');
      if (vento >= 15) vermelhos.k.push('vento de ' + fmt(vento) + ' nós (limite: 15)');
      if (raj != null && raj > 20) vermelhos.k.push('rajadas de ' + fmt(raj) + ' nós (limite: 20)');
    }
    else if (vento > 10 || (raj != null && raj > 15)) { k = Math.max(k, 1); motivos.push('vento moderado ou rajadas'); }
  }
  if (onda != null) {
    if (onda > 1.0) { k = 2; motivos.push('ondas acima de 1,0 m'); vermelhos.k.push('ondas de ' + fmt(onda) + ' m (limite: 1 m)'); }
    else if (onda >= 0.8) { k = Math.max(k, 1); motivos.push('ondas de até ' + onda.toFixed(1).replace('.', ',') + ' m, perto do limite de 1,0 m'); }
  }
  if (per != null && per < 6 && vento >= 8) { k = Math.max(k, 1); motivos.push('mar curto e batido'); }
  if (trov || (precip != null && precip >= 10)) {
    k = 2; motivos.push('risco de trovoadas ou chuva forte');
    if (trov) vermelhos.k.push('trovoada prevista');
    if (precip != null && precip >= 10) vermelhos.k.push('chuva de ' + fmt(precip) + ' mm no dia (limite: 10 mm)');
  }
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) { k = Math.max(k, 1); motivos.push('pancadas de chuva'); }

  // ----- Surfe iniciante
  let s = 0;
  if (onda != null && onda < 0.4) { s = 1; }
  if (onda != null && onda > 1.0) s = Math.max(s, 1);
  if (onda != null && onda > 1.5) { s = 2; vermelhos.s.push('ondas de ' + fmt(onda) + ' m (limite: 1,5 m)'); }
  if (vento != null && vento >= 15) { s = 2; vermelhos.s.push('vento de ' + fmt(vento) + ' nós (limite: 15)'); }
  else if (vento != null && vento > 10) s = Math.max(s, 1);
  if (trov || (precip != null && precip >= 10)) {
    s = 2;
    if (trov) vermelhos.s.push('trovoada prevista');
    if (precip != null && precip >= 10) vermelhos.s.push('chuva de ' + fmt(precip) + ' mm no dia (limite: 10 mm)');
  }
  else if ((precip != null && precip >= 2) || (prob != null && prob >= 60)) s = Math.max(s, 1);

  const diverge = (onda != null && ondaMin != null && onda - ondaMin > 0.3) || (vento != null && ventoMin != null && vento - ventoMin > 4);
  return { k, s, motivos, vermelhos, sul, diverge };
}
