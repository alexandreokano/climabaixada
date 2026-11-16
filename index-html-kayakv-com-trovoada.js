/* ONDE: index.html, dentro de function kayakV(o,tide)
   BUSQUE (Cmd+F) esta linha: */
  if(o.rain>=1){up(1);r.push(`chuva ${o.rain.toFixed(1)} mm/h`)}

/* COLE logo DEPOIS dela (nova linha, antes do "if(tide&&...") */
  if(o.wc!=null&&o.wc>=95){up(2);r.push('trovoada prevista')}
  else if(o.pp!=null&&o.pp>60){up(1);r.push(`chance de chuva ${o.pp}%`)}

/* Resultado esperado: o trecho final do kayakV fica assim:

  if(o.rain>=1){up(1);r.push(`chuva ${o.rain.toFixed(1)} mm/h`)}
  if(o.wc!=null&&o.wc>=95){up(2);r.push('trovoada prevista')}
  else if(o.pp!=null&&o.pp>60){up(1);r.push(`chance de chuva ${o.pp}%`)}
  if(tide&&tide.state=='vazante'&&...){...}
  return{l,r,warn};
*/