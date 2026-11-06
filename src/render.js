import { LINHAS, COLUNAS, MINAS, SIMBOLOS } from "./config.js";
import { pintar, corDoNumero } from "./cores.js";
import { segundosDecorridos } from "./regras.js";

// Decide o símbolo e a cor de uma célula. Não imprime nada.
export function descreverCelula(
  celula,
  { simbolos = SIMBOLOS, mostrarMinas = false } = {},
) {
  if (celula.bandeira && !celula.revelada) {
    return { simbolo: simbolos.bandeira, cor: "amarelo" };
  }
  if (!celula.revelada) {
    if (mostrarMinas && celula.temMina) {
      return { simbolo: simbolos.mina, cor: "vermelho" };
    }
    return { simbolo: simbolos.fechada, cor: "branco" };
  }
  if (celula.temMina) {
    return { simbolo: simbolos.mina, cor: "vermelho" };
  }
  if (celula.vizinhas === 0) {
    return { simbolo: simbolos.vazia, cor: "branco" };
  }
  return {
    simbolo: String(celula.vizinhas),
    cor: corDoNumero(celula.vizinhas),
  };
}

// Devolve o tabuleiro como texto. Quem imprime é o index.js.
export function renderizarTabuleiro(tabuleiro, opcoes = {}) {
  const larguraNumero = String(LINHAS).length;
  const margem = " ".repeat(larguraNumero + 1);

  const letras = [];
  for (let j = 0; j < COLUNAS; j++) {
    letras.push(String.fromCharCode(65 + j));
  }

  const borda = pintar("+" + "-".repeat(COLUNAS * 2 + 1) + "+", "ciano");
  const linhasDoTexto = [];

  linhasDoTexto.push(margem + " " + pintar(letras.join(" "), "ciano"));
  linhasDoTexto.push(margem + borda);

  for (let i = 0; i < tabuleiro.length; i++) {
    const simbolos = [];
    for (let j = 0; j < tabuleiro[i].length; j++) {
      const { simbolo, cor } = descreverCelula(tabuleiro[i][j], opcoes);
      simbolos.push(pintar(simbolo, cor));
    }
    const numero = pintar(String(i + 1).padStart(larguraNumero), "ciano");
    const lado = pintar("|", "ciano");
    linhasDoTexto.push(numero + " " + lado + " " + simbolos.join(" ") + " " + lado);
  }

  linhasDoTexto.push(margem + borda);
  return linhasDoTexto.join("\n");
}

export function renderizarStatus(jogo, agora = Date.now()) {
  const restantes = MINAS - jogo.bandeiras;
  const tempo = segundosDecorridos(jogo, agora);
  return pintar(`Minas restantes: ${restantes}   Tempo: ${tempo}s`, "azul");
}

export function textoTitulo() {
  return pintar("=== CAMPO MINADO ===", "ciano");
}

export function textoAjuda(simbolos = SIMBOLOS) {
  const linhasDoTexto = [
    pintar("Comandos:", "azul"),
    "  r B3    abre a casa B3 (coluna B, linha 3)",
    "  b B3    põe ou tira a bandeira em B3",
    "  ajuda   mostra esta lista",
    "  sair    encerra o jogo",
    "",
    pintar("Símbolos:", "azul"),
    `  ${simbolos.fechada} fechada   ${simbolos.bandeira} bandeira   ${simbolos.vazia} vazia   1-8 minas ao redor   ${simbolos.mina} mina`,
  ];
  return linhasDoTexto.join("\n");
}
