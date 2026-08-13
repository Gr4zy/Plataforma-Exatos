/* ==========================================================
   1) DADOS DO QUIZ
   Em vez de escrever cada questão "na mão" no HTML, guardamos
   tudo em um array de objetos. Isso é o que permite reaproveitar
   o mesmo HTML/CSS pra QUALQUER quantidade de perguntas.
   ========================================================== */
   const quizData = [
    {
      topico: "Funções do 1° Grau",
      pergunta: "Qual é a raiz da função f(x) = 2x - 6?",
      opcoes: ["x = -3", "x = 3", "x = 6", "x = -6", "x = 12"],
      correta: 2, // índice da opção certa (C)
      resolucao: "A raiz é o valor de x que torna f(x) = 0. Fazendo 2x - 6 = 0, temos 2x = 6, logo x = 6."
    },
    {
      topico: "Funções do 1° Grau",
      pergunta: "Qual é o coeficiente angular da função f(x) = 3x + 4?",
      opcoes: ["4", "3", "-3", "1", "7"],
      correta: 1,
      resolucao: "Numa função do 1° grau f(x) = ax + b, o coeficiente angular é o valor de a. Aqui a = 3."
    },
    {
      topico: "Funções do 1° Grau",
      pergunta: "Em f(x) = -2x + 8, para qual valor de x temos f(x) = 0?",
      opcoes: ["x = 2", "x = -4", "x = 8", "x = 4", "x = -2"],
      correta: 3,
      resolucao: "Fazendo -2x + 8 = 0, temos -2x = -8, logo x = 4."
    },
    {
      topico: "Funções do 1° Grau",
      pergunta: "A função f(x) = 5x é classificada como:",
      opcoes: ["Afim", "Linear", "Constante", "Quadrática", "Do 2° grau"],
      correta: 1,
      resolucao: "Quando f(x) = ax (sem termo independente, ou seja, b = 0), a função é chamada de linear."
    },
    {
      topico: "Funções do 1° Grau",
      pergunta: "Qual o valor de f(2) na função f(x) = 4x - 1?",
      opcoes: ["7", "8", "9", "6", "5"],
      correta: 0,
      resolucao: "Basta substituir x por 2: f(2) = 4 × 2 - 1 = 8 - 1 = 7."
    }
  ];
  
  /* ==========================================================
     2) ESTADO DA APLICAÇÃO
     Variáveis que controlam "onde o usuário está" no quiz.
     ========================================================== */
  let questaoAtual = 0;
  const respostasUsuario = new Array(quizData.length).fill(null);
  
  const PONTOS_INICIAIS = 0;
  const PONTOS_POR_ACERTO = 10;
  let pontosAtuais = PONTOS_INICIAIS;
  // Controla quais questões já somaram pontos, pra não contar 2x
  const pontosContados = new Array(quizData.length).fill(false);
  
  /* ==========================================================
     3) REFERÊNCIAS AOS ELEMENTOS DO DOM
     Pegamos tudo uma vez só, no início, por performance.
     ========================================================== */
  const telaInicial = document.getElementById('tela-inicial');
  const telaQuiz = document.getElementById('tela-quiz');
  const btnComecar = document.getElementById('btn-comecar');
  const linkSairQuiz = document.getElementById('link-sair-quiz');
  
  const form = document.getElementById('quiz-form');
  const badgeQuestao = document.getElementById('badge-questao');
  const topicoEl = document.getElementById('topico');
  const progressoEl = document.getElementById('progresso');
  const perguntaEl = document.getElementById('pergunta');
  const optionsContainer = document.getElementById('options-container');
  const explicacaoEl = document.getElementById('explicacao-atual');
  const explicacaoStatusEl = document.getElementById('explicacao-status');
  const explicacaoTextoEl = document.getElementById('explicacao-texto');
  const dotsContainer = document.getElementById('dots-container');
  const btnProximo = document.getElementById('btn-proximo');
  const resultBox = document.getElementById('result-box');
  const scoreEl = document.getElementById('score');
  const totalEl = document.getElementById('total');
  const resultTopicEl = document.getElementById('result-topic');
  const resultPercentEl = document.getElementById('result-percent');
  const reviewListEl = document.getElementById('review-list');
  const btnVoltarInicio = document.getElementById('btn-voltar-inicio');
  const pontosEl = document.getElementById('pontos');
  
  const LETRAS = ['A', 'B', 'C', 'D', 'E'];
  
  /* ==========================================================
     4) RENDERIZAÇÃO
     Toda vez que a questão muda, reconstruímos o conteúdo
     dinâmico da tela a partir do quizData.
     ========================================================== */
  function renderizarQuestao() {
    const dados = quizData[questaoAtual];
  
    badgeQuestao.textContent = `Questão ${questaoAtual + 1}`;
    topicoEl.textContent = dados.topico;
    progressoEl.textContent = `${questaoAtual + 1} / ${quizData.length}`;
    perguntaEl.textContent = dados.pergunta;
  
    // Limpa as opções antigas e cria as novas via JS (createElement)
    optionsContainer.innerHTML = '';
  
    dados.opcoes.forEach((textoOpcao, indice) => {
      const label = document.createElement('label');
      label.className = 'option';
  
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'resposta';
      input.value = indice;
      if (respostasUsuario[questaoAtual] === indice) {
        input.checked = true;
      }
  
      const letra = document.createElement('span');
      letra.className = 'option-letter';
      letra.textContent = LETRAS[indice];
  
      label.appendChild(input);
      label.appendChild(letra);
      label.appendChild(document.createTextNode(textoOpcao));
      optionsContainer.appendChild(label);
    });
  
    // Na última questão o botão de avançar vira "Finalizar"
    btnProximo.textContent = questaoAtual === quizData.length - 1 ? 'Finalizar' : 'Próxima →';
  
    // Se a questão já foi respondida antes, reexibe o feedback visual e a resolução
    if (respostasUsuario[questaoAtual] !== null) {
      aplicarFeedbackVisual(respostasUsuario[questaoAtual]);
    } else {
      explicacaoEl.classList.add('hidden');
    }
  
    renderizarDots();
  }
  
  function renderizarDots() {
    dotsContainer.innerHTML = '';
    quizData.forEach((_, indice) => {
      const dot = document.createElement('span');
      dot.className = 'dot' + (indice === questaoAtual ? ' active' : '');
      dot.classList.toggle('done', indice < questaoAtual);
      dotsContainer.appendChild(dot);
    });
  }
  
  /* ==========================================================
     5) EVENTOS
     ========================================================== */
  
  // Guarda a resposta escolhida e marca a opção de verde (certa) ou
  // vermelho (errada). Sem mostrar resolução e sem contar pontos aqui —
  // isso só aparece no resultado final.
  optionsContainer.addEventListener('change', (evento) => {
    if (evento.target.name !== 'resposta') return;
  
    const indiceEscolhido = Number(evento.target.value);
    respostasUsuario[questaoAtual] = indiceEscolhido;
  
    aplicarFeedbackVisual(indiceEscolhido);
  });
  
  // Marca a opção escolhida em verde (certa) ou vermelho (errada)
  // e mostra a resolução da questão logo abaixo, nos dois casos.
  function aplicarFeedbackVisual(indiceEscolhido) {
    const labels = optionsContainer.querySelectorAll('.option');
    const dados = quizData[questaoAtual];
    const indiceCorreto = dados.correta;
    const acertou = indiceEscolhido === indiceCorreto;
  
    labels.forEach(label => label.classList.remove('correct', 'wrong'));
  
    if (acertou) {
      labels[indiceEscolhido].classList.add('correct');
    } else {
      labels[indiceEscolhido].classList.add('wrong');
      // Também destaca qual era a opção certa
      labels[indiceCorreto].classList.add('correct');
    }
  
    explicacaoStatusEl.textContent = acertou ? 'Correto!' : 'Incorreto';
    explicacaoTextoEl.textContent = dados.resolucao;
    explicacaoEl.classList.remove('correct', 'wrong');
    explicacaoEl.classList.add(acertou ? 'correct' : 'wrong');
    explicacaoEl.classList.remove('hidden');
  }
  
  // Envio do formulário = avançar (ou finalizar, na última questão)
  form.addEventListener('submit', (evento) => {
    evento.preventDefault(); // impede o recarregamento padrão da página
  
    if (questaoAtual < quizData.length - 1) {
      questaoAtual++;
      renderizarQuestao();
    } else {
      finalizarQuiz();
    }
  });
  
  function finalizarQuiz() {
    let acertos = 0;
    quizData.forEach((dados, indice) => {
      if (respostasUsuario[indice] === dados.correta) acertos++;
    });
  
    // Pontuação só é calculada e exibida aqui, no final
    pontosAtuais = acertos * PONTOS_POR_ACERTO;
    pontosEl.textContent = pontosAtuais;
  
    scoreEl.textContent = acertos;
    totalEl.textContent = quizData.length;
    resultTopicEl.textContent = quizData[0].topico;
  
    const percentual = Math.round((acertos / quizData.length) * 100);
    resultPercentEl.textContent = `${percentual}% — ${mensagemPorPercentual(percentual)}`;
  
    renderizarRevisao();
  
    form.classList.add('hidden');
    dotsContainer.classList.add('hidden');
    resultBox.classList.remove('hidden');
  }
  
  function mensagemPorPercentual(percentual) {
    if (percentual === 100) return 'Excelente, gabaritou!';
    if (percentual >= 60) return 'Bom trabalho!';
    if (percentual >= 40) return 'Você está no caminho, continue treinando!';
    return 'Vamos revisar o conteúdo?';
  }
  
  // Monta os cards de revisão de cada questão, mostrando resposta do
  // usuário, a resposta correta e a resolução — só aparece aqui, no final.
  function renderizarRevisao() {
    reviewListEl.innerHTML = '';
  
    quizData.forEach((dados, indice) => {
      const respostaUsuario = respostasUsuario[indice];
      const acertou = respostaUsuario === dados.correta;
  
      const card = document.createElement('div');
      card.className = 'review-card' + (acertou ? ' correct' : ' wrong');
  
      const icon = document.createElement('span');
      icon.className = 'review-icon';
      icon.textContent = acertou ? '✓' : '✕';
  
      const body = document.createElement('div');
      body.className = 'review-body';
  
      const pergunta = document.createElement('p');
      pergunta.className = 'review-question';
      pergunta.textContent = `${indice + 1}. ${dados.pergunta}`;
      body.appendChild(pergunta);
  
      if (!acertou) {
        const suaResposta = document.createElement('p');
        suaResposta.className = 'review-sua-resposta';
        suaResposta.textContent = respostaUsuario === null
          ? 'Sua resposta: não respondida'
          : `Sua resposta: ${LETRAS[respostaUsuario]}) ${dados.opcoes[respostaUsuario]}`;
        body.appendChild(suaResposta);
      }
  
      const correta = document.createElement('p');
      correta.className = 'review-correta';
      correta.textContent = `Correta: ${LETRAS[dados.correta]}) ${dados.opcoes[dados.correta]}`;
      body.appendChild(correta);
  
      const resolucao = document.createElement('p');
      resolucao.className = 'review-resolucao';
      resolucao.textContent = dados.resolucao;
      body.appendChild(resolucao);
  
      card.appendChild(icon);
      card.appendChild(body);
      reviewListEl.appendChild(card);
    });
  }
  
  btnVoltarInicio.addEventListener('click', () => {
    window.location.href = '/';
  });
  
  function reiniciarQuiz() {
    questaoAtual = 0;
    respostasUsuario.fill(null);
    pontosContados.fill(false);
    pontosAtuais = PONTOS_INICIAIS;
    pontosEl.textContent = pontosAtuais;
    form.classList.remove('hidden');
    dotsContainer.classList.remove('hidden');
    resultBox.classList.add('hidden');
    renderizarQuestao();
  }
  
  /* ==========================================================
     6) NAVEGAÇÃO ENTRE TELAS (inicial ↔ quiz)
     ========================================================== */
  btnComecar.addEventListener('click', () => {
    // Garante que o quiz sempre comece do zero
    reiniciarQuiz();
  
    telaInicial.classList.add('hidden');
    telaQuiz.classList.remove('hidden');
  });
  
  linkSairQuiz.addEventListener('click', (evento) => {
    evento.preventDefault();
    telaQuiz.classList.add('hidden');
    telaInicial.classList.remove('hidden');
  });
  
  /* ==========================================================
     7) INICIALIZAÇÃO
     ========================================================== */
  renderizarQuestao();
  