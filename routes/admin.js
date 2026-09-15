var express = require('express');
var router = express.Router();

const {
  sequelize,
  Lesson,
  Attachment,
  Quiz,
  Question,
  QuizQuestion,
  QuestionImage,
  User,
} = require('../models');
const LessonStatus = require('../models/enums/LessonStatus');
const UserProfile = require('../models/enums/UserProfile');
const { exigirGestor, exigirGestorPagina, exigirAdmin } = require('../middlewares/auth');
const { lessonToAula, quizToJSON, nivelToLevel, perguntaToQuestionAttrs } = require('./mappers');

/* =========================================================================
 * AULAS (Lesson) - RF02
 * RN04 - apenas administradores e bolsistas criam, editam ou excluem.
 * ======================================================================= */

router.get('/aulas', exigirGestorPagina, function (req, res) {
  res.render('admin/aulas', { title: 'Cadastrar Aula' });
});

const includeAulaCompleta = [{ model: Attachment, as: 'attachments' }];

router.get('/aulas/api/aulas', exigirGestor, async function (req, res, next) {
  try {
    const aulas = await Lesson.findAll({
      where: { excluido: false },
      include: includeAulaCompleta,
      order: [['createdAt', 'DESC']],
    });
    res.json(aulas.map(lessonToAula));
  } catch (erro) {
    next(erro);
  }
});

router.get('/aulas/api/aulas/:id', exigirGestor, async function (req, res, next) {
  try {
    const aula = await Lesson.findOne({
      where: { id: req.params.id, excluido: false },
      include: includeAulaCompleta,
    });
    if (!aula) {
      return res.status(404).json({ erro: 'Aula não encontrada.' });
    }
    res.json(lessonToAula(aula));
  } catch (erro) {
    next(erro);
  }
});

router.post('/aulas/api/aulas', exigirGestor, async function (req, res, next) {
  const { titulo, descricao, link, status, materiais } = req.body;

  if (!titulo || !descricao || !link) {
    return res.status(400).json({ erro: 'Título, descrição e URL da aula são obrigatórios.' });
  }

  try {
    const novaAula = await sequelize.transaction(async (t) => {
      const aula = await Lesson.create(
        {
          title: titulo,
          description: descricao,
          video: link,
          status: status || LessonStatus.PUBLISHED,
        },
        { transaction: t }
      );

      await criarMateriais(aula.id, materiais, t);
      return aula;
    });

    const aulaCompleta = await Lesson.findByPk(novaAula.id, { include: includeAulaCompleta });
    res.status(201).json(lessonToAula(aulaCompleta));
  } catch (erro) {
    next(erro);
  }
});

router.put('/aulas/api/aulas/:id', exigirGestor, async function (req, res, next) {
  try {
    const aulaExistente = await Lesson.findOne({ where: { id: req.params.id, excluido: false } });
    if (!aulaExistente) {
      return res.status(404).json({ erro: 'Aula não encontrada.' });
    }

    const { titulo, descricao, link, status, materiais } = req.body;

    if (!titulo || !descricao || !link) {
      return res.status(400).json({ erro: 'Título, descrição e URL da aula são obrigatórios.' });
    }

    await sequelize.transaction(async (t) => {
      await aulaExistente.update(
        {
          title: titulo,
          description: descricao,
          video: link,
          status: status || aulaExistente.status,
        },
        { transaction: t }
      );

      await Attachment.destroy({ where: { lessonId: aulaExistente.id }, transaction: t });
      await criarMateriais(aulaExistente.id, materiais, t);
    });

    const aulaAtualizada = await Lesson.findByPk(aulaExistente.id, { include: includeAulaCompleta });
    res.json(lessonToAula(aulaAtualizada));
  } catch (erro) {
    next(erro);
  }
});

// RF02 - exclusão lógica (excluído = true), nunca removida fisicamente
router.delete('/aulas/api/aulas/:id', exigirGestor, async function (req, res, next) {
  try {
    const aula = await Lesson.findOne({ where: { id: req.params.id, excluido: false } });
    if (!aula) {
      return res.status(404).json({ erro: 'Aula não encontrada.' });
    }
    await aula.update({ excluido: true });
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

async function criarMateriais(lessonId, materiais, transaction) {
  if (!Array.isArray(materiais)) return;
  const validos = materiais
    .filter((m) => m && m.url && m.url.trim() !== '')
    .map((m) => ({
      lessonId,
      name: (m.titulo && m.titulo.trim()) || 'Material',
      file: m.url.trim(),
    }));
  if (validos.length) {
    await Attachment.bulkCreate(validos, { transaction });
  }
}

/* =========================================================================
 * QUIZZES (Quiz / Question / QuizQuestion) - RF05, RF06
 * ======================================================================= */

router.get('/quizzes', exigirGestorPagina, function (req, res) {
  res.render('admin/quizzes', { title: 'Cadastrar Quiz' });
});

const includeQuizCompleto = [
  {
    model: QuizQuestion,
    as: 'quizQuestions',
    include: [
      {
        model: Question,
        as: 'question',
        include: [{ model: QuestionImage, as: 'images' }],
      },
    ],
  },
];

router.get('/quizzes/api/quizzes', exigirGestor, async function (req, res, next) {
  try {
    const quizzes = await Quiz.findAll({
      include: includeQuizCompleto,
      order: [['createdAt', 'DESC']],
    });
    res.json(quizzes.map(quizToJSON));
  } catch (erro) {
    next(erro);
  }
});

router.get('/quizzes/api/quizzes/:id', exigirGestor, async function (req, res, next) {
  try {
    const quiz = await Quiz.findOne({
      where: { id: req.params.id },
      include: includeQuizCompleto,
    });
    if (!quiz) {
      return res.status(404).json({ erro: 'Quiz não encontrado.' });
    }
    res.json(quizToJSON(quiz));
  } catch (erro) {
    next(erro);
  }
});

function validarPerguntas(perguntas) {
  if (!Array.isArray(perguntas) || perguntas.length === 0) {
    return 'Informe um título e pelo menos uma pergunta.';
  }
  for (const pergunta of perguntas) {
    const alternativasValidas = Array.isArray(pergunta.alternativas)
      ? pergunta.alternativas.filter((a) => a && a.texto && a.texto.trim() !== '')
      : [];

    if (!pergunta.enunciado || pergunta.enunciado.trim() === '') {
      return 'Toda pergunta precisa de um enunciado.';
    }
    if (alternativasValidas.length < 2) {
      return 'Cada pergunta precisa de pelo menos 2 alternativas.';
    }
    if (alternativasValidas.length > 3) {
      return 'Cada pergunta admite no máximo 3 alternativas (de acordo com o diagrama de classes).';
    }
    if (!alternativasValidas.some((a) => a.correta)) {
      return 'Marque a alternativa correta de cada pergunta.';
    }
  }
  return null;
}

// Recria (do zero) as Question + QuizQuestion de um quiz.
async function criarPerguntas(quizId, perguntas, transaction) {
  for (let indice = 0; indice < perguntas.length; indice++) {
    const pergunta = perguntas[indice];
    const question = await Question.create(perguntaToQuestionAttrs(pergunta), { transaction });
    await QuizQuestion.create({ quizId, questionId: question.id, order: indice }, { transaction });
  }
}

// Remove os vínculos QuizQuestion de um quiz e apaga as Questions que
// ficarem órfãs (sem nenhum outro quiz apontando para elas).
async function removerPerguntasDoQuiz(quizId, transaction) {
  const vinculos = await QuizQuestion.findAll({ where: { quizId }, transaction });
  const questionIds = vinculos.map((v) => v.questionId);

  await QuizQuestion.destroy({ where: { quizId }, transaction });

  for (const questionId of questionIds) {
    const aindaUsada = await QuizQuestion.findOne({ where: { questionId }, transaction });
    if (!aindaUsada) {
      await Question.destroy({ where: { id: questionId }, transaction });
    }
  }
}

router.post('/quizzes/api/quizzes', exigirGestor, async function (req, res, next) {
  const { titulo, aulaId, perguntas, categoria, dificuldade } = req.body;
  const erroValidacao = !titulo ? 'Informe um título e pelo menos uma pergunta.' : validarPerguntas(perguntas);

  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }

  try {
    const novoQuiz = await sequelize.transaction(async (t) => {
      const quiz = await Quiz.create(
        {
          title: titulo,
          lessonId: aulaId || null,
          category: categoria || 'Geral',
          level: nivelToLevel(dificuldade || 'Básico'),
        },
        { transaction: t }
      );
      await criarPerguntas(quiz.id, perguntas, t);
      return quiz;
    });

    const quizCompleto = await Quiz.findByPk(novoQuiz.id, { include: includeQuizCompleto });
    res.status(201).json(quizToJSON(quizCompleto));
  } catch (erro) {
    next(erro);
  }
});

router.put('/quizzes/api/quizzes/:id', exigirGestor, async function (req, res, next) {
  try {
    const quizExistente = await Quiz.findByPk(req.params.id);
    if (!quizExistente) {
      return res.status(404).json({ erro: 'Quiz não encontrado.' });
    }

    const { titulo, aulaId, perguntas, categoria, dificuldade } = req.body;
    const erroValidacao = !titulo ? 'Informe um título e pelo menos uma pergunta.' : validarPerguntas(perguntas);

    if (erroValidacao) {
      return res.status(400).json({ erro: erroValidacao });
    }

    await sequelize.transaction(async (t) => {
      await quizExistente.update(
        {
          title: titulo,
          lessonId: aulaId || null,
          category: categoria || quizExistente.category,
          level: dificuldade ? nivelToLevel(dificuldade) : quizExistente.level,
        },
        { transaction: t }
      );

      // Recria as perguntas do zero a cada edição (mais simples e seguro do
      // que tentar casar IDs individualmente).
      await removerPerguntasDoQuiz(quizExistente.id, t);
      await criarPerguntas(quizExistente.id, perguntas, t);
    });

    const quizAtualizado = await Quiz.findByPk(quizExistente.id, { include: includeQuizCompleto });
    res.json(quizToJSON(quizAtualizado));
  } catch (erro) {
    next(erro);
  }
});

router.delete('/quizzes/api/quizzes/:id', exigirGestor, async function (req, res, next) {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) {
      return res.status(404).json({ erro: 'Quiz não encontrado.' });
    }
    // O diagrama não prevê exclusão lógica para Quiz: removemos de fato,
    // junto com os vínculos QuizQuestion (cascade) e as perguntas órfãs.
    await sequelize.transaction(async (t) => {
      await removerPerguntasDoQuiz(quiz.id, t);
      await quiz.destroy({ transaction: t });
    });
    res.status(204).send();
  } catch (erro) {
    next(erro);
  }
});

/* =========================================================================
 * USUÁRIOS (User) - RF09 (exclusivo do administrador)
 * RN03 - alunos não podem se autopromover; a promoção só acontece aqui.
 * ======================================================================= */

const PERFIS_VALIDOS = {
  aluno: UserProfile.STUDENT,
  bolsista: UserProfile.SCHOLAR,
  administrador: UserProfile.ADMIN,
};

router.get('/usuarios/api/usuarios', exigirAdmin, async function (req, res, next) {
  try {
    const usuarios = await User.findAll({ order: [['name', 'ASC']] });
    res.json(
      usuarios.map((u) => ({
        id: u.id,
        nome: u.name,
        email: u.email,
        perfil: u.profile,
        ativo: !u.excluido,
        pontos: u.points,
      }))
    );
  } catch (erro) {
    next(erro);
  }
});

router.put('/usuarios/api/usuarios/:id', exigirAdmin, async function (req, res, next) {
  try {
    const usuario = await User.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const { nome, perfil, ativo } = req.body;
    const dados = {};
    if (nome) dados.name = nome;
    if (perfil && PERFIS_VALIDOS[perfil] !== undefined) dados.profile = PERFIS_VALIDOS[perfil];
    if (typeof ativo === 'boolean') dados.excluido = !ativo;

    await usuario.update(dados);
    res.json({
      id: usuario.id,
      nome: usuario.name,
      email: usuario.email,
      perfil: usuario.profile,
      ativo: !usuario.excluido,
      pontos: usuario.points,
    });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
