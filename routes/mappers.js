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

// Um Question do diagrama guarda exatamente 3 alternativas fixas
// (alternative_1/2/3) e um campo "correct" apontando qual delas é a certa.
function questionToPergunta(question) {
  const q = question.toJSON ? question.toJSON() : question;
  const alternativas = [];
  ['alternative_1', 'alternative_2', 'alternative_3'].forEach((chave) => {
    if (q[chave] && q[chave].trim() !== '') {
      alternativas.push({ texto: q[chave], correta: q.correct === chave });
    }
  });
  return {
    id: q.id,
    enunciado: q.statement,
    resolucao: q.explanation,
    imagemUrl: (q.images && q.images[0] && q.images[0].image) || null,
    alternativas,
  };
}

// Recebe { enunciado, alternativas: [{texto, correta}], resolucao } vindo do
// formulário e devolve os campos já no formato do model Question.
function perguntaToQuestionAttrs(pergunta) {
  const alternativasValidas = (pergunta.alternativas || []).filter(
    (a) => a && a.texto && a.texto.trim() !== ''
  );
  const chaves = ['alternative_1', 'alternative_2', 'alternative_3'];
  const attrs = {
    statement: pergunta.enunciado.trim(),
    explanation: (pergunta.resolucao || '').trim(),
    correct: 'alternative_1',
  };

  alternativasValidas.slice(0, 3).forEach((alternativa, indice) => {
    attrs[chaves[indice]] = alternativa.texto.trim();
    if (alternativa.correta) attrs.correct = chaves[indice];
  });

  return attrs;
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

module.exports = {
  NIVEIS,
  levelToNivel,
  nivelToLevel,
  attachmentToMaterial,
  lessonToAula,
  questionToPergunta,
  perguntaToQuestionAttrs,
  quizToJSON,
};
