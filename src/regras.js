import { LINHAS, COLUNAS, MINAS } from "./config.js";
import {
  DIRECOES,
  criarTabuleiro,
  posicionarMinas,
  calcularVizinhas,
  dentroDoTabuleiro,
} from "./tabuleiro.js";

// Nada aqui lê do teclado nem imprime. As funções mexem no objeto jogo e
// devolvem { ok: true } ou { ok: false, mensagem } para quem chamou decidir
// o que mostrar.

export function criarJogo() {
  return {
    tabuleiro: criarTabuleiro(),
    status: "jogando", // "jogando" | "venceu" | "perdeu"
    bandeiras: 0,
    dicas: 0,
    primeiraJogada: true,
    inicio: null,
    fim: null,
  };
}

export function contarReveladas(tabuleiro) {
  let total = 0;
  for (const linha of tabuleiro) {
    for (const celula of linha) {
      if (celula.revelada) {
        total = total + 1;
      }
    }
  }
  return total;
}

export function venceu(tabuleiro) {
  return contarReveladas(tabuleiro) === LINHAS * COLUNAS - MINAS;
}

// Flood fill com pilha. Recursão chegaria a 64 chamadas empilhadas num
// tabuleiro vazio; a pilha explícita evita isso e deixa o fluxo à vista.
export function revelarCascata(tabuleiro, linha, coluna) {
  const pilha = [[linha, coluna]];

  while (pilha.length > 0) {
    const [l, c] = pilha.pop();
    const celula = tabuleiro[l][c];

    if (celula.revelada || celula.bandeira) {
      continue;
    }
    celula.revelada = true;

    if (celula.vizinhas > 0) {
      continue;
    }

    for (const [dl, dc] of DIRECOES) {
      const nl = l + dl;
      const nc = c + dc;
      if (dentroDoTabuleiro(nl, nc)) {
        pilha.push([nl, nc]);
      }
    }
  }
}

// posicoesFixas e agora servem só para os testes.
export function revelar(
  jogo,
  linha,
  coluna,
  { posicoesFixas = null, agora = Date.now() } = {},
) {
  if (jogo.status !== "jogando") {
    return { ok: false, mensagem: "A partida já terminou." };
  }

  const celula = jogo.tabuleiro[linha][coluna];

  if (celula.revelada) {
    return { ok: false, mensagem: "Essa casa já está aberta." };
  }
  if (celula.bandeira) {
    return {
      ok: false,
      mensagem: "Há uma bandeira nessa casa. Remova com 'b' antes de abrir.",
    };
  }

  // As minas só entram na primeira jogada, para ela nunca cair em uma.
  if (jogo.primeiraJogada) {
    posicionarMinas(jogo.tabuleiro, linha, coluna, posicoesFixas);
    calcularVizinhas(jogo.tabuleiro);
    jogo.primeiraJogada = false;
    jogo.inicio = agora;
  }

  if (celula.temMina) {
    celula.revelada = true;
    jogo.status = "perdeu";
    jogo.fim = agora;
    return { ok: true };
  }

  revelarCascata(jogo.tabuleiro, linha, coluna);

  if (venceu(jogo.tabuleiro)) {
    jogo.status = "venceu";
    jogo.fim = agora;
  }
  return { ok: true };
}

export function alternarBandeira(jogo, linha, coluna) {
  if (jogo.status !== "jogando") {
    return { ok: false, mensagem: "A partida já terminou." };
  }

  const celula = jogo.tabuleiro[linha][coluna];

  if (celula.revelada) {
    return { ok: false, mensagem: "Não dá para marcar uma casa aberta." };
  }

  celula.bandeira = !celula.bandeira;
  jogo.bandeiras = jogo.bandeiras + (celula.bandeira ? 1 : -1);
  return { ok: true };
}

export function segundosDecorridos(jogo, agora = Date.now()) {
  if (jogo.inicio === null) {
    return 0;
  }
  const ate = jogo.fim ?? agora;
  return Math.floor((ate - jogo.inicio) / 1000);
}

// Abre uma casa segura que ainda está fechada e sem bandeira. Não dá para
// pedir antes da primeira jogada, porque as minas ainda não existem.
export function pedirDica(jogo, { aleatorio = Math.random, agora } = {}) {
  if (jogo.status !== "jogando") {
    return { ok: false, mensagem: "A partida já terminou." };
  }
  if (jogo.primeiraJogada) {
    return {
      ok: false,
      mensagem: "Abra uma casa antes: as minas só são sorteadas na primeira jogada.",
    };
  }

  const seguras = [];
  for (let i = 0; i < jogo.tabuleiro.length; i++) {
    for (let j = 0; j < jogo.tabuleiro[i].length; j++) {
      const celula = jogo.tabuleiro[i][j];
      if (!celula.temMina && !celula.revelada && !celula.bandeira) {
        seguras.push([i, j]);
      }
    }
  }

  if (seguras.length === 0) {
    return { ok: false, mensagem: "Não sobrou casa segura sem bandeira." };
  }

  const [linha, coluna] = seguras[Math.floor(aleatorio() * seguras.length)];
  revelar(jogo, linha, coluna, agora === undefined ? {} : { agora });
  jogo.dicas = jogo.dicas + 1;
  return { ok: true, linha, coluna };
}
