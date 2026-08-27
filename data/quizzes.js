// data/quizzes.js
// Armazenamento em memória dos quizzes cadastrados.
//
// Estrutura de um quiz:
// {
//   id: 1,
//   titulo: "Quiz - Função do 1º Grau",
//   aulaId: 1 | null,
//   perguntas: [
//     {
//       enunciado: "Qual é o coeficiente angular de y = 2x + 3?",
//       alternativas: [
//         { texto: "2", correta: true },
//         { texto: "3", correta: false },
//         ...
//       ],
//       resolucao: "O coeficiente angular é o número que multiplica o x..."
//     }
//   ]
// }

let listaDeQuizzes = [];
let proximoId = 1;

function listarQuizzes() {
  return listaDeQuizzes;
}

function buscarQuizPorId(id) {
  return listaDeQuizzes.find(q => q.id === Number(id));
}

function normalizarPerguntas(perguntas) {
  if (!Array.isArray(perguntas)) return [];

  return perguntas
    .filter(p => p && p.enunciado && p.enunciado.trim() !== "")
    .map(p => {
      const alternativas = Array.isArray(p.alternativas)
        ? p.alternativas
            .filter(a => a && a.texto && a.texto.trim() !== "")
            .map(a => ({ texto: a.texto.trim(), correta: !!a.correta }))
        : [];

      return {
        enunciado: p.enunciado.trim(),
        alternativas,
        resolucao: (p.resolucao || "").trim()
      };
    });
}

function adicionarQuiz({ titulo, aulaId, perguntas }) {
  const novoQuiz = {
    id: proximoId++,
    titulo,
    aulaId: aulaId ? Number(aulaId) : null,
    perguntas: normalizarPerguntas(perguntas)
  };
  listaDeQuizzes.push(novoQuiz);
  return novoQuiz;
}

function atualizarQuiz(id, { titulo, aulaId, perguntas }) {
  const quiz = buscarQuizPorId(id);
  if (!quiz) return null;

  quiz.titulo = titulo;
  quiz.aulaId = aulaId ? Number(aulaId) : null;
  quiz.perguntas = normalizarPerguntas(perguntas);

  return quiz;
}

function removerQuiz(id) {
  const indice = listaDeQuizzes.findIndex(q => q.id === Number(id));
  if (indice === -1) return false;
  listaDeQuizzes.splice(indice, 1);
  return true;
}

module.exports = {
  listarQuizzes,
  buscarQuizPorId,
  adicionarQuiz,
  atualizarQuiz,
  removerQuiz
};
