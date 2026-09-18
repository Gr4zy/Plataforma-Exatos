/* ==========================================================
   Tela de quiz do aluno - conectada à API real:
     GET  /classes/api/aulas/:id/quiz            -> carrega o quiz da aula
     POST /classes/api/quizzes/:quizId/responder -> registra cada resposta

   Cada resposta é enviada ao servidor assim que o aluno escolhe uma
   alternativa. A partir daí a questão fica travada (não é mais possível
   trocar a resposta), tanto na tela quanto no banco de dados.
   ========================================================== */

(function () {
  const aulaId = window.QUIZ_AULA_ID;

  /* ===== REFERÊNCIAS AOS ELEMENTOS DO DOM ===== */
  const estadoCarregando = document.getElementById('estado-carregando');
  const estadoErro = document.getElementById('estado-erro');
  const estadoErroTexto = document.getElementById('estado-erro-texto');

  const telaInicial = document.getElementById('tela-inicial');
  const telaQuiz = document.getElementById('tela-quiz');
  const btnComecar = document.getElementById('btn-comecar');
  const linkSairQuiz = document.getElementById('link-sair-quiz');

  const introTitulo = document.getElementById('intro-titulo');
  const introDescricao = document.getElementById('intro-descricao');
  const introTotalPerguntas = document.getElementById('intro-total-perguntas');
  const introDificuldade = document.getElementById('intro-dificuldade');
  const introPontosPossiveis = document.getElementById('intro-pontos-possiveis');
  const introProgressoTexto = document.getElementById('intro-progresso-texto');

  const form = document.getElementById('quiz-form');
  const badgeQuestao = document.getElementById('badge-questao');
  const topicoEl = document.getElementById('topico');
  const progressoEl = document.getElementById('progresso');
  const perguntaImagemEl = document.getElementById('pergunta-imagem');
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

  const lightbox = document.getElementById('lightbox');
  const lightboxImagem = document.getElementById('lightbox-imagem');
  const lightboxFechar = document.getElementById('lightbox-fechar');

  const PONTOS_POR_ACERTO = 10;

  

  let quizData = null; // resposta da API (título, perguntas, progresso...)
  let questaoAtual = 0;
  let enviandoResposta = false;

  function letraAlternativa(indice) {
    return String.fromCharCode(65 + indice); // A, B, C, D, ...
  }

  /* ==========================================================
     1) CARREGAMENTO DO QUIZ
     ========================================================== */
  async function carregarQuiz() {
    if (!aulaId) {
      mostrarErro('Selecione uma aula na página de Videoaulas e clique em "Fazer Quiz" para começar.');
      return;
    }

    try {
      const resposta = await fetch(`/classes/api/aulas/${aulaId}/quiz`);
      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarErro(dados.erro || 'Não foi possível carregar o quiz desta aula.');
        return;
      }

      if (!Array.isArray(dados.perguntas) || dados.perguntas.length === 0) {
        mostrarErro('Este quiz ainda não possui perguntas cadastradas.');
        return;
      }

      quizData = dados;
      montarTelaInicial();
    } catch (erro) {
      mostrarErro('Não foi possível se conectar ao servidor. Tente novamente.');
    }
  }

  function mostrarErro(mensagem) {
    estadoCarregando.classList.add('hidden');
    estadoErroTexto.textContent = mensagem;
    estadoErro.classList.remove('hidden');
  }

  function montarTelaInicial() {
    estadoCarregando.classList.add('hidden');

    introTitulo.textContent = quizData.titulo;
    introDescricao.textContent = quizData.descricao && quizData.descricao.trim()
      ? quizData.descricao
      : 'Questões de múltipla escolha. Leia com atenção antes de responder — depois de respondida, a questão não pode ser alterada.';
    introTotalPerguntas.textContent = quizData.perguntas.length;
    introDificuldade.textContent = quizData.dificuldade || '-';
    introPontosPossiveis.textContent = `+${quizData.perguntas.length * PONTOS_POR_ACERTO}`;

    if (quizData.concluido) {
      introProgressoTexto.textContent = `Você já concluiu este quiz! Pontuação: ${quizData.pontuacao} pontos.`;
      introProgressoTexto.classList.remove('hidden');
      btnComecar.textContent = 'Ver resultado';
    } else if (quizData.progresso > 0) {
      introProgressoTexto.textContent = `Você já respondeu ${quizData.progresso} de ${quizData.perguntas.length} questões. Continue de onde parou.`;
      introProgressoTexto.classList.remove('hidden');
      btnComecar.textContent = 'Continuar quiz';
    } else {
      introProgressoTexto.classList.add('hidden');
      btnComecar.textContent = 'Começar Quiz';
    }

    telaInicial.classList.remove('hidden');
  }

  /* ==========================================================
     2) RENDERIZAÇÃO DA QUESTÃO ATUAL
     ========================================================== */
  function indicePrimeiraNaoRespondida() {
    const indice = quizData.perguntas.findIndex((p) => !p.respondida);
    return indice === -1 ? quizData.perguntas.length - 1 : indice;
  }

  function renderizarQuestao() {
    const pergunta = quizData.perguntas[questaoAtual];

    badgeQuestao.textContent = `Questão ${questaoAtual + 1}`;
    topicoEl.textContent = quizData.categoria || quizData.titulo;
    progressoEl.textContent = `${questaoAtual + 1} / ${quizData.perguntas.length}`;
    perguntaEl.textContent = pergunta.enunciado;

    if (pergunta.imagemUrl) {
      perguntaImagemEl.src = pergunta.imagemUrl;
      perguntaImagemEl.classList.remove('hidden');
    } else {
      perguntaImagemEl.classList.add('hidden');
      perguntaImagemEl.removeAttribute('src');
    }

    optionsContainer.innerHTML = '';

    pergunta.alternativas.forEach((alternativa, indice) => {
      const label = document.createElement('label');
      label.className = 'option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = 'resposta';
      input.value = alternativa.id;

      if (pergunta.respondida) {
        input.disabled = true;
        if (alternativa.id === pergunta.suaAlternativaId) input.checked = true;

        if (alternativa.correta) {
          label.classList.add('correct');
        } else if (alternativa.id === pergunta.suaAlternativaId) {
          label.classList.add('wrong');
        }
        label.classList.add('disabled');
      }

      const letra = document.createElement('span');
      letra.className = 'option-letter';
      letra.textContent = letraAlternativa(indice);

      label.appendChild(input);
      label.appendChild(letra);

      if (alternativa.imagemUrl) {
        const img = document.createElement('img');
        img.src = alternativa.imagemUrl;
        img.className = 'option-image';
        img.alt = `Alternativa ${letraAlternativa(indice)}`;
        label.appendChild(img);
      }

      label.appendChild(document.createTextNode(alternativa.texto));
      optionsContainer.appendChild(label);
    });

    btnProximo.textContent = questaoAtual === quizData.perguntas.length - 1 ? 'Finalizar' : 'Próxima →';
    btnProximo.disabled = !pergunta.respondida;

    if (pergunta.respondida) {
      exibirFeedback(pergunta);
    } else {
      explicacaoEl.classList.add('hidden');
    }

    renderizarDots();
  }

  function exibirFeedback(pergunta) {
    explicacaoStatusEl.textContent = pergunta.acertou ? 'Correto!' : 'Incorreto';
    explicacaoTextoEl.textContent = pergunta.resolucao || '';
    explicacaoEl.classList.remove('correct', 'wrong', 'hidden');
    explicacaoEl.classList.add(pergunta.acertou ? 'correct' : 'wrong');
  }

  function renderizarDots() {
    dotsContainer.innerHTML = '';
    quizData.perguntas.forEach((pergunta, indice) => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      if (indice === questaoAtual) dot.classList.add('active');
      if (pergunta.respondida) dot.classList.add('done');
      dotsContainer.appendChild(dot);
    });
  }

  /* ==========================================================
     3) ENVIO DA RESPOSTA (trava a questão no servidor)
     ========================================================== */
  optionsContainer.addEventListener('change', async (evento) => {
    if (evento.target.name !== 'resposta' || enviandoResposta) return;

    const pergunta = quizData.perguntas[questaoAtual];
    if (pergunta.respondida) return; // já travada, não deveria nem chegar aqui

    const alternativeId = Number(evento.target.value);

    // Trava a UI imediatamente para não permitir clicar em outra alternativa
    // enquanto a resposta ainda está sendo enviada ao servidor.
    enviandoResposta = true;
    optionsContainer.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.disabled = true;
    });

    try {
      const resposta = await fetch(`/classes/api/quizzes/${quizData.id}/responder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: pergunta.id, alternativeId }),
      });
      const resultado = await resposta.json();

      if (!resposta.ok) {
        // 409 = a questão já tinha sido respondida antes (ex.: em outra aba).
        alert(resultado.erro || 'Não foi possível registrar sua resposta.');
        await recarregarProgresso();
        return;
      }

      // Atualiza o estado local da pergunta com o resultado do servidor.
      pergunta.respondida = true;
      pergunta.suaAlternativaId = alternativeId;
      pergunta.acertou = resultado.correta;
      pergunta.resolucao = resultado.resolucao;
      pergunta.alternativas.forEach((alt) => {
        alt.correta = alt.id === resultado.alternativaCorretaId;
      });

      quizData.progresso = resultado.progresso;
      quizData.pontuacao = resultado.pontuacao;
      quizData.concluido = resultado.concluido;

      renderizarQuestao();
    } catch (erro) {
      alert('Não foi possível se conectar ao servidor. Tente novamente.');
      optionsContainer.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.disabled = false;
      });
    } finally {
      enviandoResposta = false;
    }
  });

  // Caso a resposta não seja confirmada (ex.: erro de rede), busca de novo o
  // estado real salvo no servidor para manter a tela sempre consistente com
  // o banco de dados.
  async function recarregarProgresso() {
    try {
      const resposta = await fetch(`/classes/api/aulas/${aulaId}/quiz`);
      const dados = await resposta.json();
      if (resposta.ok) {
        quizData = dados;
        renderizarQuestao();
      }
    } catch (erro) {
      // Mantém o estado atual em tela se nem isso funcionar.
    }
  }

  /* ==========================================================
     4) NAVEGAÇÃO ENTRE QUESTÕES
     ========================================================== */
  btnProximo.addEventListener('click', () => {
    if (btnProximo.disabled) return;

    if (questaoAtual < quizData.perguntas.length - 1) {
      questaoAtual++;
      renderizarQuestao();
    } else {
      finalizarQuiz();
    }
  });

  function finalizarQuiz() {
    const total = quizData.perguntas.length;
    const acertos = quizData.perguntas.filter((p) => p.acertou).length;

    scoreEl.textContent = acertos;
    totalEl.textContent = total;
    resultTopicEl.textContent = quizData.titulo;

    const percentual = Math.round((acertos / total) * 100);
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

  function renderizarRevisao() {
    reviewListEl.innerHTML = '';

    quizData.perguntas.forEach((pergunta, indice) => {
      const acertou = !!pergunta.acertou;
      const alternativaCorreta = pergunta.alternativas.find((a) => a.correta);
      const suaAlternativa = pergunta.alternativas.find((a) => a.id === pergunta.suaAlternativaId);

      const card = document.createElement('div');
      card.className = 'review-card' + (acertou ? ' correct' : ' wrong');

      const icon = document.createElement('span');
      icon.className = 'review-icon';
      icon.textContent = acertou ? '✓' : '✕';

      const body = document.createElement('div');
      body.className = 'review-body';

      const perguntaTexto = document.createElement('p');
      perguntaTexto.className = 'review-question';
      perguntaTexto.textContent = `${indice + 1}. ${pergunta.enunciado}`;
      body.appendChild(perguntaTexto);

      if (!acertou) {
        const suaResposta = document.createElement('p');
        suaResposta.className = 'review-sua-resposta';
        suaResposta.textContent = suaAlternativa
          ? `Sua resposta: ${suaAlternativa.texto}`
          : 'Sua resposta: não respondida';
        body.appendChild(suaResposta);
      }

      if (alternativaCorreta) {
        const correta = document.createElement('p');
        correta.className = 'review-correta';
        correta.textContent = `Correta: ${alternativaCorreta.texto}`;
        body.appendChild(correta);
      }

      if (pergunta.resolucao) {
        const resolucao = document.createElement('p');
        resolucao.className = 'review-resolucao';
        resolucao.textContent = pergunta.resolucao;
        body.appendChild(resolucao);
      }

      card.appendChild(icon);
      card.appendChild(body);
      reviewListEl.appendChild(card);
    });
  }

  btnVoltarInicio.addEventListener('click', () => {
    window.location.href = '/classes';
  });

  /* ==========================================================
     5) NAVEGAÇÃO ENTRE TELAS (inicial ↔ quiz)
     ========================================================== */
  btnComecar.addEventListener('click', () => {
    telaInicial.classList.add('hidden');
    telaQuiz.classList.remove('hidden');

    form.classList.remove('hidden');
    dotsContainer.classList.remove('hidden');
    resultBox.classList.add('hidden');

    if (quizData.concluido) {
      questaoAtual = quizData.perguntas.length - 1;
      renderizarQuestao();
      finalizarQuiz();
    } else {
      questaoAtual = indicePrimeiraNaoRespondida();
      renderizarQuestao();
    }
  });

  linkSairQuiz.addEventListener('click', (evento) => {
    evento.preventDefault();
    telaQuiz.classList.add('hidden');
    telaInicial.classList.remove('hidden');
    montarTelaInicial();
  });

  /* ==========================================================
     6) INICIALIZAÇÃO
     ========================================================== */
  carregarQuiz();
})();
