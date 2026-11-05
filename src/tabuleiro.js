function criarCelula() {
  return { temMina: false, revelada: false, bandeira: false, vizinhas: 0 };
}

const linhas = 8;
const colunas = 8;

function criarTabuleiro() {
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
const t = criarTabuleiro();
console.log(t.length, t[0].length);
