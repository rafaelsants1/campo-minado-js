import {
  criarTabuleiro,
  posicionarMinas,
  calcularVizinhas,
} from "./tabuleiro.js";

const t = criarTabuleiro();
console.log(t.length, t[0].length);

posicionarMinas(t, 0, 0);
calcularVizinhas(t);
let total = 0;

for (let i = 0; i < t.length; i++) {
  for (let j = 0; j < t[i].length; j++) {
    if (t[i][j].temMina) {
      total = total + 1;
    }
  }
}
console.log(total);
console.log(t[0][0].vizinhas);
