import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { SIMBOLOS, SIMBOLOS_ASCII } from "./config.js";
import { pintar, vermelho, verde, amarelo } from "./cores.js";
import {
  criarJogo,
  revelar,
  alternarBandeira,
  pedirDica,
  segundosDecorridos,
} from "./regras.js";
import { interpretarComando } from "./entrada.js";
import { lerRecorde, registrarVitoria } from "./recorde.js";
import {
  renderizarTabuleiro,
  renderizarStatus,
  textoTitulo,
  textoAjuda,
} from "./render.js";

const simbolos = process.argv.includes("--ascii") ? SIMBOLOS_ASCII : SIMBOLOS;

// "B3" a partir de linha e coluna (índices que começam em 0).
function nomeDaCasa(linha, coluna) {
  return String.fromCharCode(65 + coluna) + (linha + 1);
}

function desenhar(jogo, aviso, recorde, opcoes = {}) {
  if (stdout.isTTY) {
    console.clear();
  }
  console.log(textoTitulo());
  console.log();
  console.log(renderizarTabuleiro(jogo.tabuleiro, { simbolos, ...opcoes }));
  console.log();
  console.log(renderizarStatus(jogo, Date.now(), recorde));
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
  const recordeAnterior = lerRecorde();
  let aviso = amarelo("Digite 'ajuda' para ver os comandos.");

  while (jogo.status === "jogando") {
    desenhar(jogo, aviso, recordeAnterior);
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

    if (comando.acao === "dica") {
      const dica = pedirDica(jogo);
      aviso = dica.ok
        ? verde(`Dica: abri ${nomeDaCasa(dica.linha, dica.coluna)}, que é segura.`)
        : amarelo(dica.mensagem);
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

  desenhar(jogo, "", recordeAnterior, { mostrarMinas: true });
  const segundos = segundosDecorridos(jogo);
  if (jogo.status === "venceu") {
    console.log(verde(`Você venceu em ${segundos}s!`));
    if (jogo.dicas > 0) {
      console.log(amarelo(`Você usou ${jogo.dicas} dica(s), então o tempo não vale recorde.`));
    } else {
      const registro = registrarVitoria(segundos);
      if (registro.novoRecorde) {
        console.log(verde("Novo recorde!"));
      } else {
        console.log(`Seu recorde continua em ${registro.melhor}s.`);
      }
      if (registro.novoRecorde && !registro.salvo) {
        console.log(amarelo("Não consegui gravar o recorde em disco."));
      }
    }
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
