# Campo Minado no terminal

Campo Minado em JavaScript puro (Node.js), jogado inteiramente no terminal. Tabuleiro 8×8 com 10 minas, cores ANSI, bandeiras, abertura em cascata, cronômetro, recorde e dicas. Sem nenhuma dependência externa.

Trabalho em squad. Avaliação: funcionalidade e GitHub, lógica, clareza do código, validação e criatividade.

```
=== CAMPO MINADO ===

   A B C D E F G H
  +-----------------+
1 | · · · · · 1 ■ ■ |
2 | · · · · · 1 ■ ■ |
3 | · 1 1 1 · 1 ■ ■ |
4 | · 2 ■ 2 · 1 ■ ■ |
5 | 1 3 ■ 2 · 1 ■ ■ |
6 | ■ ■ ■ 1 · 1 ■ ■ |
7 | ■ ■ ■ 1 · 2 ■ ■ |
8 | ■ ■ ■ 1 · 2 ■ ⚑ |
  +-----------------+

Minas restantes: 9   Tempo: 0s
Comando>
```

## Como rodar

Precisa do Node.js 18 ou mais novo (desenvolvido e testado no 24).

```bash
git clone https://github.com/rafaelsants1/campo-minado-js.git
cd campo-minado-js
npm start
```

Não tem `npm install`: o projeto não usa pacotes de terceiros.

Opções, que vão depois do comando (`npm start -- --ascii`):

| Opção | O que faz |
|---|---|
| `--ascii` | troca `■ · ⚑` por `# . F`, para terminais que não mostram Unicode |
| `--sem-cor` | desliga as cores (a variável de ambiente `NO_COLOR` também funciona) |

## Como jogar

O jogo pergunta um comando por vez. A coluna é a letra e a linha é o número, então `B3` é a coluna B, linha 3.

| Comando | O que faz |
|---|---|
| `r B3` | abre a casa B3 |
| `b B3` | põe ou tira a bandeira em B3 |
| `dica` (ou `d`) | abre uma casa segura. A partida deixa de valer recorde |
| `ajuda` (ou `?`) | mostra os comandos e os símbolos |
| `sair` (ou `q`) | encerra o jogo. `Ctrl+C` também funciona |

Maiúsculas, minúsculas e espaços sobrando não importam: `R b3`, `rB3` e `r B3` fazem a mesma coisa.

**Objetivo:** abrir todas as casas sem mina. Cada número diz quantas das 8 casas ao redor têm mina. Se você abrir uma casa vazia (`·`), o jogo abre sozinho toda a área vazia em volta.

A primeira jogada nunca cai em uma mina, porque as minas só são sorteadas depois dela.

### Símbolos

| Símbolo | Significa |
|---|---|
| `■` | casa fechada |
| `·` | casa aberta, sem minas ao redor |
| `1` a `8` | casa aberta, com essa quantidade de minas ao redor |
| `⚑` | bandeira |
| `*` | mina |

### Cores

| Cor | Código | Usada em |
|---|---|---|
| vermelho | `\x1b[31m` | mina, mensagens de erro, número 3 |
| verde | `\x1b[32m` | vitória, dica, número 2 |
| amarelo | `\x1b[33m` | bandeira, avisos, número 5 |
| azul | `\x1b[34m` | barra de status, títulos de seção, número 1 |
| magenta | `\x1b[35m` | número 4 |
| ciano | `\x1b[36m` | título, bordas, letras e números de posição, número 6 |
| branco | `\x1b[37m` | casa fechada, casa vazia, números 7 e 8 |

A cor ajuda, mas nunca é a única informação: cada estado tem um símbolo próprio, e o jogo funciona igual com `--sem-cor`.

## Decisões de implementação

### Função de cor

Em vez de escrever os códigos ANSI direto nos `console.log`, usamos uma função própria, `pintar(texto, cor)`, em [src/cores.js](src/cores.js). Os motivos:

- **O reset nunca é esquecido.** A função sempre fecha o texto com `\x1b[0m`. Quem escreve o código ANSI à mão uma vez esquece, e o terminal fica pintado até o fim da sessão.
- **Um lugar só para desligar as cores.** `NO_COLOR` e `--sem-cor` são tratados dentro da função, e o resto do código não precisa saber disso.
- **Testável.** O teste confere que a saída termina com o reset (`tests/render.test.js`).

### Lógica do jogo

- **Matriz de objetos.** O tabuleiro é uma matriz 8×8 e cada casa é `{ temMina, revelada, bandeira, vizinhas }`. O número de vizinhas é calculado uma vez, depois que as minas são sorteadas, e guardado na própria casa.
- **Vizinhança.** Um vetor com os 8 deslocamentos `[linha, coluna]` evita escrever 8 `if`. Antes de olhar um vizinho, `dentroDoTabuleiro` descarta quem cairia fora, e é isso que faz cantos e bordas funcionarem.
- **Cascata iterativa.** Abrir uma casa vazia usa uma pilha (flood fill) em vez de recursão. Num tabuleiro vazio, a recursão empilharia dezenas de chamadas. A pilha é explícita, fácil de acompanhar, e não passa por casas já abertas nem por bandeiras.
- **Minas depois da primeira jogada.** `posicionarMinas` sorteia fora da casa escolhida, então não existe derrota no primeiro clique.
- **Vitória.** O jogador vence quando `reveladas === 64 - 10`, ou seja, quando só sobraram as minas fechadas.
- **Sorteio sem repetir.** O sorteio roda num `while` que só conta uma mina quando a casa sorteada é válida. Com um `for` de 10 voltas, uma repetição deixaria o tabuleiro com menos de 10 minas.

### Camadas

A lógica não lê do teclado nem imprime. Quem fala com o terminal é só o `index.js`.

| Arquivo | Responsabilidade | Faz I/O? |
|---|---|---|
| [src/config.js](src/config.js) | tamanho, número de minas e símbolos | não |
| [src/cores.js](src/cores.js) | funções de cor ANSI | não |
| [src/tabuleiro.js](src/tabuleiro.js) | criar o tabuleiro, sortear minas, contar vizinhas | não |
| [src/regras.js](src/regras.js) | abrir, cascata, bandeira, dica, vitória, derrota, cronômetro | não |
| [src/entrada.js](src/entrada.js) | transformar o texto digitado em um comando validado | não |
| [src/render.js](src/render.js) | transformar o estado em texto colorido | não |
| [src/recorde.js](src/recorde.js) | ler e gravar o melhor tempo em `recorde.json` | arquivo |
| [src/index.js](src/index.js) | loop do jogo, leitura do teclado, impressão, tratamento de erros | sim |

As funções das regras devolvem `{ ok: true }` ou `{ ok: false, mensagem }`, e quem chamou decide o que mostrar.

### Validação da entrada

`interpretarComando` (em [src/entrada.js](src/entrada.js)) trata o texto antes de qualquer outra coisa: `trim`, maiúsculas, expressão regular e limites. Cada erro tem mensagem própria, por exemplo:

```
A coluna Z não existe. Use de A a H.
A linha 9 não existe. Use de 1 a 8.
Faltou o comando. Use "r B3" para abrir ou "b B3" para marcar.
```

Casa já aberta e casa com bandeira são avisadas pelas regras, sem quebrar o jogo. `Ctrl+C` e `Ctrl+D` encerram sem erro, e o loop inteiro roda dentro de um `try/catch`.

### Extras

- **Cronômetro.** Começa na primeira jogada e para quando a partida termina.
- **Recorde.** O melhor tempo de vitória fica em `recorde.json` (arquivo local, fora do git). Se o arquivo não existir ou estiver estragado, o jogo começa sem recorde.
- **Dica.** Abre uma casa segura aleatória. Para ser justo, partida com dica não conta para o recorde.
- **Modo sem Unicode e sem cor** para terminais mais simples.

## Requisitos do trabalho

| Requisito | Onde está |
|---|---|
| Condicionais | `descreverCelula` (cadeia de `if` por estado da casa), validações em `entrada.js` e `regras.js` |
| Laços | dois `for` aninhados para montar e percorrer o tabuleiro; `while` no sorteio das minas e no loop do jogo; `while` da pilha na cascata |
| Funções | todo o código, com funções pequenas e de uma responsabilidade só |
| Vetores | `DIRECOES`, pilha da cascata, lista de casas seguras na dica |
| Matrizes | o tabuleiro 8×8 |
| Objetos | a casa, o estado do jogo e o comando interpretado |
| Cores ANSI | `src/cores.js`, usadas em `render.js` e `index.js` |
| Testes | `tests/`, 55 testes |

## Testes

```bash
npm test
```

Usa o `node:test` que já vem com o Node, sem biblioteca extra. São 55 testes em 5 arquivos:

| Arquivo | O que cobre |
|---|---|
| `tests/tabuleiro.test.js` | tabuleiro 8×8, 10 minas, primeira jogada segura, vizinhas em canto, borda e meio |
| `tests/regras.test.js` | cascata, bandeira, vitória, derrota, partida travada após o fim, cronômetro, dica |
| `tests/entrada.test.js` | comandos válidos, variações de escrita, erros de formato e de limite |
| `tests/render.test.js` | símbolo e cor de cada estado, desenho do tabuleiro, reset das cores |
| `tests/recorde.test.js` | gravação, arquivo inexistente ou estragado, falha de escrita |

Para os testes de regras serem previsíveis, `posicionarMinas` e `revelar` aceitam posições fixas de minas, e as funções de tempo e sorteio recebem o relógio ou o gerador como parâmetro.

## Fluxo de Git

```
main        ← versões estáveis (protegida, só recebe PR de develop)
 └─ develop ← integração
     └─ feature/*, test/*, docs/*  ← uma branch por entrega
```

- Commits pequenos, no padrão Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- Todo trabalho entra por Pull Request revisado por outro membro da squad.
- Versão final marcada com a tag `v1.0.0`.

## Limitações conhecidas

- Não existe o "chording" (abrir as casas vizinhas quando o número já tem as bandeiras certas).
- O tamanho é fixo em 8×8 com 10 minas. Dá para mudar em `src/config.js`, mas o cabeçalho de letras foi pensado para até 26 colunas.
- O recorde é só do computador onde o jogo roda.

## Equipe

| Nome | GitHub |
|---|---|
| Rafael Santos | [@rafaelsants1](https://github.com/rafaelsants1) |
| _(completar com os demais membros da squad)_ | |
