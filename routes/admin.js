var express = require('express');
var router = express.Router();

const {
  listarAulas,
  buscarAulaPorId,
  adicionarAula,
  atualizarAula,
  removerAula
} = require('../data/aulas');

const {
  listarQuizzes,
  buscarQuizPorId,
  adicionarQuiz,
  atualizarQuiz,
  removerQuiz
} = require('../data/quizzes');

router.get('/aulas', function (req, res) {
  res.render('admin/aulas', { title: 'Cadastrar Aula' });
});

router.get('/aulas/api/aulas', function (req, res) {
  res.json(listarAulas());
});

router.get('/aulas/api/aulas/:id', function (req, res) {
  const aula = buscarAulaPorId(req.params.id);
  if (!aula) {
    return res.status(404).json({ erro: 'Aula não encontrada.' });
  }
  res.json(aula);
});

router.post('/aulas/api/aulas', function (req, res) {
  const { titulo, subtitulo, descricao, link, nivel, materiais } = req.body;

  if (!titulo || !descricao || !link) {
    return res.status(400).json({ erro: 'Título, descrição e URL da aula são obrigatórios.' });
  }

  const novaAula = adicionarAula({ titulo, subtitulo, descricao, link, nivel, materiais });
  res.status(201).json(novaAula);
});

router.put('/aulas/api/aulas/:id', function (req, res) {
  const aulaExistente = buscarAulaPorId(req.params.id);
  if (!aulaExistente) {
    return res.status(404).json({ erro: 'Aula não encontrada.' });
  }

  const { titulo, subtitulo, descricao, link, nivel, materiais } = req.body;

  if (!titulo || !descricao || !link) {
    return res.status(400).json({ erro: 'Título, descrição e URL da aula são obrigatórios.' });
  }

  const aulaAtualizada = atualizarAula(req.params.id, { titulo, subtitulo, descricao, link, nivel, materiais });
  res.json(aulaAtualizada);
});

router.delete('/aulas/api/aulas/:id', function (req, res) {
  const removido = removerAula(req.params.id);
  if (!removido) {
    return res.status(404).json({ erro: 'Aula não encontrada.' });
  }
  res.status(204).send();
});

/* QUIZZES*/

router.get('/quizzes', function (req, res) {
  res.render('admin/quizzes', { title: 'Cadastrar Quiz' });
});

router.get('/quizzes/api/quizzes', function (req, res) {
  res.json(listarQuizzes());
});

router.get('/quizzes/api/quizzes/:id', function (req, res) {
  const quiz = buscarQuizPorId(req.params.id);
  if (!quiz) {
    return res.status(404).json({ erro: 'Quiz não encontrado.' });
  }
  res.json(quiz);
});

router.post('/quizzes/api/quizzes', function (req, res) {
  const { titulo, aulaId, perguntas } = req.body;

  if (!titulo || !Array.isArray(perguntas) || perguntas.length === 0) {
    return res.status(400).json({ erro: 'Informe um título e pelo menos uma pergunta.' });
  }

  for (const pergunta of perguntas) {
    const alternativasValidas = Array.isArray(pergunta.alternativas)
      ? pergunta.alternativas.filter(a => a && a.texto && a.texto.trim() !== '')
      : [];

    if (!pergunta.enunciado || pergunta.enunciado.trim() === '') {
      return res.status(400).json({ erro: 'Toda pergunta precisa de um enunciado.' });
    }
    if (alternativasValidas.length < 2) {
      return res.status(400).json({ erro: 'Cada pergunta precisa de pelo menos 2 alternativas.' });
    }
    if (!alternativasValidas.some(a => a.correta)) {
      return res.status(400).json({ erro: 'Marque a alternativa correta de cada pergunta.' });
    }
  }

  const novoQuiz = adicionarQuiz({ titulo, aulaId, perguntas });
  res.status(201).json(novoQuiz);
});

router.put('/quizzes/api/quizzes/:id', function (req, res) {
  const quizExistente = buscarQuizPorId(req.params.id);
  if (!quizExistente) {
    return res.status(404).json({ erro: 'Quiz não encontrado.' });
  }

  const { titulo, aulaId, perguntas } = req.body;

  if (!titulo || !Array.isArray(perguntas) || perguntas.length === 0) {
    return res.status(400).json({ erro: 'Informe um título e pelo menos uma pergunta.' });
  }

  for (const pergunta of perguntas) {
    const alternativasValidas = Array.isArray(pergunta.alternativas)
      ? pergunta.alternativas.filter(a => a && a.texto && a.texto.trim() !== '')
      : [];

    if (!pergunta.enunciado || pergunta.enunciado.trim() === '') {
      return res.status(400).json({ erro: 'Toda pergunta precisa de um enunciado.' });
    }
    if (alternativasValidas.length < 2) {
      return res.status(400).json({ erro: 'Cada pergunta precisa de pelo menos 2 alternativas.' });
    }
    if (!alternativasValidas.some(a => a.correta)) {
      return res.status(400).json({ erro: 'Marque a alternativa correta de cada pergunta.' });
    }
  }

  const quizAtualizado = atualizarQuiz(req.params.id, { titulo, aulaId, perguntas });
  res.json(quizAtualizado);
});

router.delete('/quizzes/api/quizzes/:id', function (req, res) {
  const removido = removerQuiz(req.params.id);
  if (!removido) {
    return res.status(404).json({ erro: 'Quiz não encontrado.' });
  }
  res.status(204).send();
});

module.exports = router;
