import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { SIMBOLOS, SIMBOLOS_ASCII } from "./config.js";
import { pintar, vermelho, verde, amarelo } from "./cores.js";
import { criarJogo, revelar, alternarBandeira, segundosDecorridos } from "./regras.js";
import { interpretarComando } from "./entrada.js";
import {
  renderizarTabuleiro,
  renderizarStatus,
  textoTitulo,
  textoAjuda,
} from "./render.js";

const simbolos = process.argv.includes("--ascii") ? SIMBOLOS_ASCII : SIMBOLOS;

function desenhar(jogo, aviso, opcoes = {}) {
  if (stdout.isTTY) {
    console.clear();
  }
  console.log(textoTitulo());
  console.log();
  console.log(renderizarTabuleiro(jogo.tabuleiro, { simbolos, ...opcoes }));
  console.log();
  console.log(renderizarStatus(jogo));
  if (aviso) {
    console.log(aviso);
  }
  console.log();
}

async function jogar() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  // O iterador guarda as linhas que chegam (inclusive coladas de uma vez).
  // Ctrl+C e Ctrl+D fecham a leitura e o iterador termina: lerComando() dá null.
  rl.on("SIGINT", () => rl.close());
  rl.setPrompt(pintar("Comando> ", "ciano"));
  const linhasDigitadas = rl[Symbol.asyncIterator]();

  async function lerComando() {
    rl.prompt();
    const { value, done } = await linhasDigitadas.next();
    return done ? null : value;
  }

  const jogo = criarJogo();
  let aviso = amarelo("Digite 'ajuda' para ver os comandos.");

  while (jogo.status === "jogando") {
    desenhar(jogo, aviso);
    aviso = "";

    const texto = await lerComando();
    if (texto === null) {
      console.log("\nJogo encerrado.");
      return;
    }

    const comando = interpretarComando(texto);
    if (!comando.valido) {
      aviso = vermelho(comando.mensagem);
      continue;
    }

    if (comando.acao === "sair") {
      console.log("Até a próxima!");
      rl.close();
      return;
    }
    if (comando.acao === "ajuda") {
      aviso = textoAjuda(simbolos);
      continue;
    }

    const resultado =
      comando.acao === "revelar"
        ? revelar(jogo, comando.linha, comando.coluna)
        : alternarBandeira(jogo, comando.linha, comando.coluna);

    if (!resultado.ok) {
      aviso = amarelo(resultado.mensagem);
    }
  }

  desenhar(jogo, "", { mostrarMinas: true });
  const segundos = segundosDecorridos(jogo);
  if (jogo.status === "venceu") {
    console.log(verde(`Você venceu em ${segundos}s!`));
  } else {
    console.log(vermelho(`Você pisou numa mina. Tempo: ${segundos}s.`));
  }
  rl.close();
}

try {
  await jogar();
} catch (erro) {
  console.error(vermelho("Erro inesperado: " + erro.message));
  process.exitCode = 1;
}
