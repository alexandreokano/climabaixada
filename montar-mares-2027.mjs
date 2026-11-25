import { readFile, writeFile } from 'node:fs/promises';

const ARQ_2026 = 'mares.json';
const ARQ_2027 = 'mares-2027.limpo.json';
const SAIDA = 'mares-2026-2027.json';

function diasDoAno(ano) {
  const dias = [];
  for (let t = Date.UTC(ano, 0, 1); new Date(t).getUTCFullYear() === ano; t += 86400000) {
    dias.push(new Date(t).toISOString().slice(0, 10));
  }
  return dias;
}

function valida(obj, nome, ano) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error(`${nome}: esperado um objeto no formato data -> eventos`);
  }
  const esperadas = diasDoAno(ano);
  const set = new Set(esperadas);
  const faltam = esperadas.filter(d => !(d in obj));
  const sobram = Object.keys(obj).filter(k => !set.has(k));
  if (faltam.length) throw new Error(`${nome}: faltam ${faltam.length} dia(s), ex.: ${faltam.slice(0, 3).join(', ')}`);
  if (sobram.length) throw new Error(`${nome}: ${sobram.length} chave(s) fora de ${ano}, ex.: ${sobram.slice(0, 3).join(', ')}`);

  for (const dia of esperadas) {
    const evs = obj[dia];
    if (!Array.isArray(evs) || evs.length < 3 || evs.length > 7) {
      throw new Error(`${nome} ${dia}: quantidade de eventos inválida`);
    }
    let anterior = '';
    for (const e of evs) {
      const ok = Array.isArray(e) && e.length === 3
        && typeof e[0] === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(e[0])
        && (e[1] === 'A' || e[1] === 'B')
        && typeof e[2] === 'number' && Number.isFinite(e[2]) && e[2] >= -1 && e[2] <= 3;
      if (!ok) throw new Error(`${nome} ${dia}: evento inválido ${JSON.stringify(e)}`);
      if (e[0] <= anterior) throw new Error(`${nome} ${dia}: horários fora de ordem (${anterior} -> ${e[0]})`);
      anterior = e[0];
    }
  }
  return esperadas;
}

const le = async (arq) => JSON.parse(await readFile(arq, 'utf8'));

const d26 = await le(ARQ_2026);
const d27 = await le(ARQ_2027);
const dias26 = valida(d26, ARQ_2026, 2026);
const dias27 = valida(d27, ARQ_2027, 2027);

const todos = [...dias26, ...dias27];
const linhas = todos.map(d => `"${d}":${JSON.stringify(d.startsWith('2026') ? d26[d] : d27[d])}`);
const texto = '{\n' + linhas.join(',\n') + '\n}\n';

// confere o que vai ser gravado antes de gravar
const prova = JSON.parse(texto);
if (Object.keys(prova).length !== 730) throw new Error('a união não deu 730 dias');

try {
  await writeFile(SAIDA, texto, { flag: 'wx' }); // 'wx' = nunca sobrescreve
} catch (e) {
  if (e.code === 'EEXIST') {
    console.error(`${SAIDA} já existe. Renomeie ou apague esse arquivo e rode de novo.`);
    process.exit(1);
  }
  throw e;
}
console.log(`${SAIDA} criado: ${todos.length} dias. ${ARQ_2026} e ${ARQ_2027} não foram alterados.`);
