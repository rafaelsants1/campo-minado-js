import { LINHAS, COLUNAS } from "./config.js";

const ULTIMA_COLUNA = String.fromCharCode(64 + COLUNAS);
const COMANDO_COMPLETO = /^([RB])\s*([A-Z])\s*(\d{1,2})$/;
const SO_POSICAO = /^[A-Z]\s*\d{1,2}$/;

function invalido(mensagem) {
  return { valido: false, mensagem };
}

// Transforma o texto digitado em um comando. Só olha o formato e os limites;
// se a casa já está aberta ou marcada, quem avisa é o regras.js.
export function interpretarComando(texto) {
  const original = String(texto ?? "").trim();
  const entrada = original.toUpperCase();

  if (entrada === "") {
    return invalido("Digite um comando. Exemplo: r B3 (ou 'ajuda').");
  }
  if (entrada === "AJUDA" || entrada === "?" || entrada === "H") {
    return { valido: true, acao: "ajuda" };
  }
  if (entrada === "DICA" || entrada === "D") {
    return { valido: true, acao: "dica" };
  }
  if (entrada === "SAIR" || entrada === "Q") {
    return { valido: true, acao: "sair" };
  }
  if (entrada === "R" || entrada === "B") {
    return invalido("Faltou a posição. Exemplo: r B3.");
  }
  if (SO_POSICAO.test(entrada)) {
    return invalido(
      `Faltou o comando. Use "r ${entrada}" para abrir ou "b ${entrada}" para marcar.`,
    );
  }

  const partes = COMANDO_COMPLETO.exec(entrada);
  if (partes === null) {
    return invalido(
      `Não entendi "${original}". Use r B3, b B3, ajuda ou sair.`,
    );
  }

  const [, letra, letraColuna, textoLinha] = partes;
  const coluna = letraColuna.charCodeAt(0) - 65;
  const linha = Number(textoLinha) - 1;

  if (coluna >= COLUNAS) {
    return invalido(
      `A coluna ${letraColuna} não existe. Use de A a ${ULTIMA_COLUNA}.`,
    );
  }
  if (linha < 0 || linha >= LINHAS) {
    return invalido(`A linha ${textoLinha} não existe. Use de 1 a ${LINHAS}.`);
  }

  return {
    valido: true,
    acao: letra === "R" ? "revelar" : "bandeira",
    linha,
    coluna,
  };
}
