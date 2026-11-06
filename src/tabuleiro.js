import { LINHAS, COLUNAS, MINAS } from "./config.js";

// Os 8 passos possíveis a partir de uma célula: [linha, coluna].
export const DIRECOES = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

function criarCelula() {
  return { temMina: false, revelada: false, bandeira: false, vizinhas: 0 };
}

export function dentroDoTabuleiro(linha, coluna) {
  return linha >= 0 && linha < LINHAS && coluna >= 0 && coluna < COLUNAS;
}

export function criarTabuleiro() {
  const matriz = [];

  for (let i = 0; i < LINHAS; i++) {
    const linhaVazia = [];
    for (let j = 0; j < COLUNAS; j++) {
      linhaVazia.push(criarCelula());
    }
    matriz.push(linhaVazia);
  }
  return matriz;
}

// Sorteia as minas fora da célula da primeira jogada. Nos testes dá para
// passar posicoesFixas (lista de [linha, coluna]) e pular o sorteio.
export function posicionarMinas(
  tabuleiro,
  linhaInicial,
  colunaInicial,
  posicoesFixas = null,
) {
  if (posicoesFixas !== null) {
    for (const [linha, coluna] of posicoesFixas) {
      tabuleiro[linha][coluna].temMina = true;
    }
    return;
  }

  let minasColocadas = 0;

  while (minasColocadas < MINAS) {
    const linha = Math.floor(Math.random() * LINHAS);
    const coluna = Math.floor(Math.random() * COLUNAS);

    if (
      (linha === linhaInicial && coluna === colunaInicial) ||
      tabuleiro[linha][coluna].temMina
    ) {
      continue;
    }
    tabuleiro[linha][coluna].temMina = true;
    minasColocadas = minasColocadas + 1;
  }
}

export function contarVizinhas(tabuleiro, linha, coluna) {
  let total = 0;

  for (const [deslocamentoLinha, deslocamentoColuna] of DIRECOES) {
    const linhaVizinha = linha + deslocamentoLinha;
    const colunaVizinha = coluna + deslocamentoColuna;

    if (!dentroDoTabuleiro(linhaVizinha, colunaVizinha)) {
      continue;
    }

    if (tabuleiro[linhaVizinha][colunaVizinha].temMina) {
      total = total + 1;
    }
  }

  return total;
}

export function calcularVizinhas(tabuleiro) {
  for (let i = 0; i < tabuleiro.length; i++) {
    for (let j = 0; j < tabuleiro[i].length; j++) {
      tabuleiro[i][j].vizinhas = contarVizinhas(tabuleiro, i, j);
    }
  }
}
