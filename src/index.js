import {
  criarTabuleiro,
  posicionarMinas,
  contarVizinhas,
} from "./tabuleiro.js";

const t = criarTabuleiro();

// teste 1
t[0][1].temMina = true;
console.log(contarVizinhas(t, 0, 0)); // esperado 1

// teste 2
t[1][1].temMina = true;
console.log(contarVizinhas(t, 0, 0)); // esperado 2

// teste 3
console.log(contarVizinhas(t, 7, 7)); // esperado 0

console.log(t.length, t[0].length);

/*posicionarMinas(t, 0, 0);
let total = 0;

for (let i = 0; i < t.length; i++) {
  for (let j = 0; j < t[i].length; j++) {
    if (t[i][j].temMina) {
      total = total + 1;
    }
  }
}
console.log(total);

console.log(contarVizinhas(t, 0, 0));
*/
