import { test } from "node:test";
import assert from "node:assert/strict";
import { MINAS } from "../src/config.js";
import {
  criarJogo,
  revelar,
  alternarBandeira,
  contarReveladas,
  segundosDecorridos,
} from "../src/regras.js";

// Minas espalhadas: a casa A1 é segura e cada mina isola alguns números.
const ESPALHADAS = [
  [0, 1],
  [1, 3],
  [2, 5],
  [3, 7],
  [4, 0],
  [5, 2],
  [6, 4],
  [7, 6],
  [7, 0],
  [3, 3],
];

// Minas juntas no canto inferior direito: uma jogada em A1 abre todo o resto.
const AGRUPADAS = [
  [7, 7],
  [7, 6],
  [7, 5],
  [6, 7],
  [6, 6],
  [6, 5],
  [5, 7],
  [5, 6],
  [5, 5],
  [4, 7],
];

function contarMinas(tabuleiro) {
  return tabuleiro.flat().filter((celula) => celula.temMina).length;
}

test("a primeira jogada coloca as minas e nunca cai em uma", () => {
  for (let tentativa = 0; tentativa < 200; tentativa++) {
    const jogo = criarJogo();
    assert.equal(contarMinas(jogo.tabuleiro), 0);

    revelar(jogo, 0, 0);

    assert.equal(contarMinas(jogo.tabuleiro), MINAS);
    assert.equal(jogo.tabuleiro[0][0].temMina, false);
    assert.notEqual(jogo.status, "perdeu");
    assert.equal(jogo.primeiraJogada, false);
  }
});

test("a primeira jogada também é segura num canto oposto", () => {
  for (let tentativa = 0; tentativa < 200; tentativa++) {
    const jogo = criarJogo();
    revelar(jogo, 7, 7);
    assert.notEqual(jogo.status, "perdeu");
  }
});

test("um número não propaga a abertura: só a própria casa abre", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS });

  assert.equal(jogo.tabuleiro[0][0].vizinhas, 1);
  assert.equal(contarReveladas(jogo.tabuleiro), 1);
  assert.equal(jogo.status, "jogando");
});

test("a cascata abre toda a área vazia e para nos números", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: AGRUPADAS });

  // Casa vazia no canto, número na beira da área e as minas intactas.
  assert.equal(jogo.tabuleiro[0][0].revelada, true);
  assert.equal(jogo.tabuleiro[4][4].revelada, true);
  assert.equal(jogo.tabuleiro[4][4].vizinhas, 1);
  for (const [linha, coluna] of AGRUPADAS) {
    assert.equal(jogo.tabuleiro[linha][coluna].revelada, false);
  }
  assert.equal(contarReveladas(jogo.tabuleiro), 64 - MINAS);
});

test("a cascata não abre uma casa com bandeira", () => {
  const jogo = criarJogo();
  alternarBandeira(jogo, 2, 2);
  revelar(jogo, 0, 0, { posicoesFixas: AGRUPADAS });

  assert.equal(jogo.tabuleiro[2][2].revelada, false);
  assert.equal(jogo.tabuleiro[2][2].bandeira, true);
  assert.equal(jogo.status, "jogando");
});

test("abrir todas as casas seguras dá vitória", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS });

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const celula = jogo.tabuleiro[i][j];
      if (!celula.temMina && !celula.revelada) {
        revelar(jogo, i, j);
      }
    }
  }

  assert.equal(jogo.status, "venceu");
  assert.equal(contarReveladas(jogo.tabuleiro), 64 - MINAS);
});

test("uma jogada que abre tudo de uma vez também vence", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: AGRUPADAS });

  assert.equal(jogo.status, "venceu");
});

test("abrir uma mina termina o jogo com derrota", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS });
  const resultado = revelar(jogo, 3, 3);

  assert.equal(resultado.ok, true);
  assert.equal(jogo.status, "perdeu");
  assert.equal(jogo.tabuleiro[3][3].revelada, true);
});

test("depois do fim da partida nada mais responde", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS });
  revelar(jogo, 3, 3);

  const abrir = revelar(jogo, 1, 1);
  const marcar = alternarBandeira(jogo, 1, 1);

  assert.equal(abrir.ok, false);
  assert.equal(marcar.ok, false);
  assert.equal(jogo.tabuleiro[1][1].revelada, false);
  assert.equal(jogo.tabuleiro[1][1].bandeira, false);
});

test("abrir uma casa já aberta devolve aviso e não muda nada", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS });
  const antes = contarReveladas(jogo.tabuleiro);

  const resultado = revelar(jogo, 0, 0);

  assert.equal(resultado.ok, false);
  assert.ok(resultado.mensagem.length > 0);
  assert.equal(contarReveladas(jogo.tabuleiro), antes);
});

test("alternarBandeira liga, desliga e mantém o contador certo", () => {
  const jogo = criarJogo();

  assert.deepEqual(alternarBandeira(jogo, 2, 2), { ok: true });
  assert.equal(jogo.tabuleiro[2][2].bandeira, true);
  assert.equal(jogo.bandeiras, 1);

  alternarBandeira(jogo, 4, 4);
  assert.equal(jogo.bandeiras, 2);

  alternarBandeira(jogo, 2, 2);
  assert.equal(jogo.tabuleiro[2][2].bandeira, false);
  assert.equal(jogo.bandeiras, 1);
});

test("não dá para marcar bandeira numa casa aberta", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS });

  const resultado = alternarBandeira(jogo, 0, 0);

  assert.equal(resultado.ok, false);
  assert.equal(jogo.bandeiras, 0);
});

test("não dá para abrir uma casa com bandeira", () => {
  const jogo = criarJogo();
  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS });
  alternarBandeira(jogo, 0, 1); // a mina de [0][1]

  const resultado = revelar(jogo, 0, 1);

  assert.equal(resultado.ok, false);
  assert.equal(jogo.status, "jogando");
  assert.equal(jogo.tabuleiro[0][1].revelada, false);
});

test("segundosDecorridos conta da primeira jogada até o fim", () => {
  const jogo = criarJogo();
  assert.equal(segundosDecorridos(jogo, 99999), 0);

  revelar(jogo, 0, 0, { posicoesFixas: ESPALHADAS, agora: 1000 });
  assert.equal(segundosDecorridos(jogo, 3500), 2);

  revelar(jogo, 3, 3, { agora: 6500 });
  assert.equal(segundosDecorridos(jogo, 999999), 5);
});
