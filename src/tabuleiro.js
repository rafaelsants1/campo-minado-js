function criarCelula() {
  return { temMina: false, revelada: false, bandeira: false, vizinhas: 0 };
}

const linhas = 8;
const colunas = 8;
const MINAS = 10;

export function criarTabuleiro() {
  const matriz = [];

  for (let i = 0; i < linhas; i++) {
    const linhaVazia = [];
    for (let j = 0; j < colunas; j++) {
      linhaVazia.push(criarCelula());
    }
    matriz.push(linhaVazia);
  }
  return matriz;
}

export function posicionarMinas(tabuleiro, linhaInicial, colunaInicial) {
  let minasColocadas = 0;

  while (minasColocadas < MINAS) {
    const linha = Math.floor(Math.random() * linhas);
    const coluna = Math.floor(Math.random() * colunas);

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
  const direcoes = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [1, -1],
    [1, 1],
    [0, 1],
    [1, 0],
  ];
  let total = 0;
  for (let i = 0; i < direcoes.length; i++) {
    const deslocamentoLinha = direcoes[i][0];
    const deslocamentoColuna = direcoes[i][1];

    const linhaVizinha = deslocamentoLinha + linha;
    const colunaVizinha = deslocamentoColuna + coluna;

    if (
      linhaVizinha < 0 ||
      linhaVizinha >= linhas ||
      colunaVizinha < 0 ||
      colunaVizinha >= colunas
    ) {
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
