// Este módulo existe para que o front-end (views/*.hbs, já escrito antes da
// adequação ao diagrama de classes) continue funcionando sem precisar ser
// reescrito: aqui traduzimos os models novos (em inglês, de acordo com o
// diagrama) para o "formato" de JSON em português que o JS do navegador
// já sabe interpretar, e vice-versa.

const NIVEIS = ['Básico', 'Intermediário', 'Avançado'];

function levelToNivel(level) {
  return NIVEIS[level] || NIVEIS[0];
}

function nivelToLevel(nivel) {
  const indice = NIVEIS.indexOf(nivel);
  return indice === -1 ? 0 : indice;
}

function attachmentToMaterial(attachment) {
  const a = attachment.toJSON ? attachment.toJSON() : attachment;
  return { id: a.id, titulo: a.name, url: a.file };
}

function lessonToAula(lesson) {
  const l = lesson.toJSON ? lesson.toJSON() : lesson;
  return {
    id: l.id,
    titulo: l.title,
    tema: l.theme,
    descricao: l.description,
    link: l.video,
    duracao: l.duration,
    status: l.status,
    excluido: l.excluido,
    materiais: (l.attachments || []).map(attachmentToMaterial),
    createdAt: l.createdAt,
    updatedAt: l.updatedAt,
  };
}

function alternativaToJSON(alternative) {
  const a = alternative.toJSON ? alternative.toJSON() : alternative;
  return {
    id: a.id,
    texto: a.text,
    correta: a.correct,
    imagemUrl: a.image || null,
  };
}

// Uma Question agora tem quantas Alternative forem necessárias (não mais
// limitada a 3 colunas fixas). Por padrão revela qual é a correta (uso do
// painel de administração); para a tela do aluno, veja
// `questionToPerguntaAluno`, que omite essa informação nas questões ainda
// não respondidas.
function questionToPergunta(question) {
  const q = question.toJSON ? question.toJSON() : question;
  const alternativas = (q.alternatives || [])
    .slice()
    .sort((a, b) => a.order - b.order)
    .map(alternativaToJSON);
  return {
    id: q.id,
    enunciado: q.statement,
    resolucao: q.explanation,
    imagemUrl: q.image || null,
    alternativas,
  };
}

// Versão da questão pronta para ser exibida ao aluno: se `respostaDada` for
// informada (o aluno já respondeu essa questão nessa tentativa), revela qual
// alternativa é a correta e qual foi a escolhida; caso contrário, esconde o
// campo `correta` de cada alternativa para não entregar a resposta antes da
// hora.
function questionToPerguntaAluno(question, respostaDada) {
  const q = question.toJSON ? question.toJSON() : question;
  const alternativasOrdenadas = (q.alternatives || []).slice().sort((a, b) => a.order - b.order);

  const alternativas = alternativasOrdenadas.map((a) => ({
    id: a.id,
    texto: a.text,
    imagemUrl: a.image || null,
    ...(respostaDada ? { correta: a.correct } : {}),
  }));

  return {
    id: q.id,
    enunciado: q.statement,
    imagemUrl: q.image || null,
    alternativas,
    respondida: !!respostaDada,
    ...(respostaDada
      ? {
          resolucao: q.explanation,
          suaAlternativaId: respostaDada.alternativeId,
          acertou: respostaDada.correct,
        }
      : {}),
  };
}

// Recebe { enunciado, imagemUrl, alternativas, resolucao } vindo do
// formulário e devolve os campos já no formato do model Question.
function perguntaToQuestionAttrs(pergunta) {
  return {
    statement: pergunta.enunciado.trim(),
    explanation: (pergunta.resolucao || '').trim(),
    image: (pergunta.imagemUrl && pergunta.imagemUrl.trim()) || null,
  };
}

// Recebe as alternativas de uma pergunta (já filtradas) e devolve as linhas
// prontas para popular o model Alternative de uma Question já criada.
function alternativasToAttrs(questionId, alternativas) {
  return (alternativas || [])
    .filter((a) => a && a.texto && a.texto.trim() !== '')
    .map((alternativa, indice) => ({
      questionId,
      text: alternativa.texto.trim(),
      correct: !!alternativa.correta,
      image: (alternativa.imagemUrl && alternativa.imagemUrl.trim()) || null,
      order: indice,
    }));
}

function quizToJSON(quiz) {
  const q = quiz.toJSON ? quiz.toJSON() : quiz;
  const quizQuestions = (q.quizQuestions || []).slice().sort((a, b) => a.order - b.order);
  return {
    id: q.id,
    titulo: q.title,
    descricao: q.description,
    categoria: q.category,
    dificuldade: levelToNivel(q.level),
    aulaId: q.lessonId,
    perguntas: quizQuestions.map((qq) => questionToPergunta(qq.question)),
  };
}

// Versão do quiz pronta para a tela de "fazer o quiz": `respostasPorQuestao`
// é um Map<questionId, Answer> com o que o aluno já respondeu nessa
// tentativa (pode ser vazio se ele ainda não começou).
function quizToJSONAluno(quiz, respostasPorQuestao) {
  const q = quiz.toJSON ? quiz.toJSON() : quiz;
  const quizQuestions = (q.quizQuestions || []).slice().sort((a, b) => a.order - b.order);
  return {
    id: q.id,
    titulo: q.title,
    descricao: q.description,
    categoria: q.category,
    dificuldade: levelToNivel(q.level),
    aulaId: q.lessonId,
    perguntas: quizQuestions.map((qq) =>
      questionToPerguntaAluno(qq.question, respostasPorQuestao && respostasPorQuestao.get(qq.question.id))
    ),
  };
}

module.exports = {
  NIVEIS,
  levelToNivel,
  nivelToLevel,
  attachmentToMaterial,
  lessonToAula,
  questionToPergunta,
  questionToPerguntaAluno,
  perguntaToQuestionAttrs,
  alternativasToAttrs,
  quizToJSON,
  quizToJSONAluno,
};
