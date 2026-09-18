var express = require('express');
var router = express.Router();
const {
  sequelize,
  Lesson,
  Attachment,
  UserLesson,
  Quiz,
  QuizQuestion,
  Question,
  Alternative,
  UserQuiz,
  Answer,
  User,
} = require('../models');
const LessonStatus = require('../models/enums/LessonStatus');
const { exigirLogin } = require('../middlewares/auth');
const { lessonToAula, quizToJSONAluno } = require('./mappers');

const PONTOS_POR_ACERTO = 10;

const includeQuizParaAluno = [
  {
    model: QuizQuestion,
    as: 'quizQuestions',
    include: [
      {
        model: Question,
        as: 'question',
        include: [{ model: Alternative, as: 'alternatives' }],
      },
    ],
  },
];

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Videoaulas' });
});

// RF03 - lista as aulas visíveis para os alunos.
// RN07 - só aulas com status PUBLISHED e não excluídas.
router.get('/api/aulas', async (req, res, next) => {
  try {
    const aulas = await Lesson.findAll({
      where: { status: LessonStatus.PUBLISHED, excluido: false },
      include: [{ model: Attachment, as: 'attachments' }],
      order: [['createdAt', 'DESC']],
    });
    res.json(aulas.map(lessonToAula));
  } catch (erro) {
    next(erro);
  }
});

// RF03 - registra/retoma o progresso de visualização do usuário logado.
router.get('/api/aulas/:id/progresso', exigirLogin, async (req, res, next) => {
  try {
    const progresso = await UserLesson.findOne({
      where: { userId: req.session.usuario.id, lessonId: req.params.id },
    });
    res.json(
      progresso
        ? { ultimaPosicaoSegundos: progresso.video_progress, concluida: progresso.completed }
        : { ultimaPosicaoSegundos: 0, concluida: false }
    );
  } catch (erro) {
    next(erro);
  }
});

// RF03 - atualiza a posição do vídeo e/ou marca a aula como concluída.
// RN05 - a conclusão exige o consumo do vídeo (feito no front-end, que só
// chama esta rota com concluida=true perto do fim da reprodução).
router.put('/api/aulas/:id/progresso', exigirLogin, async (req, res, next) => {
  try {
    const { ultimaPosicaoSegundos, concluida } = req.body;

    const [progresso] = await UserLesson.findOrCreate({
      where: { userId: req.session.usuario.id, lessonId: req.params.id },
      defaults: { video_progress: 0, completed: false },
    });

    if (typeof ultimaPosicaoSegundos === 'number') {
      progresso.video_progress = ultimaPosicaoSegundos;
    }
    if (concluida && !progresso.completed) {
      progresso.completed = true;
    }

    await progresso.save();
    res.json({ ultimaPosicaoSegundos: progresso.video_progress, concluida: progresso.completed });
  } catch (erro) {
    next(erro);
  }
});

/* =========================================================================
 * QUIZ DO ALUNO - RF06
 * O quiz exibido ao aluno é o mesmo cadastrado pelo bolsista/administrador
 * em /admin/quizzes, associado à aula que ele acabou de assistir. O
 * progresso (quais questões já foram respondidas, pontuação) é salvo no
 * banco a cada resposta, e uma questão já respondida não pode ser
 * respondida de novo.
 * ======================================================================= */

// RF06 - devolve o quiz de uma aula, já considerando o que o aluno logado
// tiver respondido até agora (para retomar de onde parou).
router.get('/api/aulas/:id/quiz', exigirLogin, async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      where: { lessonId: req.params.id },
      include: includeQuizParaAluno,
      order: [['createdAt', 'DESC']],
    });

    if (!quiz) {
      return res.status(404).json({ erro: 'Esta aula ainda não possui um quiz cadastrado.' });
    }

    const tentativa = await UserQuiz.findOne({
      where: { userId: req.session.usuario.id, quizId: quiz.id },
      include: [{ model: Answer, as: 'answers' }],
    });

    const respostasPorQuestao = new Map();
    (tentativa ? tentativa.answers : []).forEach((resposta) => {
      respostasPorQuestao.set(resposta.questionId, resposta);
    });

    res.json({
      ...quizToJSONAluno(quiz, respostasPorQuestao),
      progresso: tentativa ? tentativa.progress : 0,
      pontuacao: tentativa ? tentativa.grade : 0,
      concluido: tentativa ? tentativa.completed : false,
    });
  } catch (erro) {
    next(erro);
  }
});

// RF06 - registra a resposta do aluno a uma questão. Uma vez respondida,
// a questão fica travada: uma nova tentativa de responder é rejeitada
// (tanto aqui quanto pela restrição única no banco de dados).
router.post('/api/quizzes/:quizId/responder', exigirLogin, async (req, res, next) => {
  try {
    const { questionId, alternativeId } = req.body;

    if (!questionId || !alternativeId) {
      return res.status(400).json({ erro: 'Informe a questão e a alternativa escolhida.' });
    }

    const quiz = await Quiz.findByPk(req.params.quizId, {
      include: [{ model: QuizQuestion, as: 'quizQuestions' }],
    });
    if (!quiz) {
      return res.status(404).json({ erro: 'Quiz não encontrado.' });
    }

    const questaoPertenceAoQuiz = quiz.quizQuestions.some(
      (qq) => Number(qq.questionId) === Number(questionId)
    );
    if (!questaoPertenceAoQuiz) {
      return res.status(400).json({ erro: 'Esta questão não pertence a este quiz.' });
    }

    const alternativaEscolhida = await Alternative.findOne({
      where: { id: alternativeId, questionId },
    });
    if (!alternativaEscolhida) {
      return res.status(400).json({ erro: 'Alternativa inválida para esta questão.' });
    }

    const totalQuestoes = quiz.quizQuestions.length;

    let resultado;
    try {
      resultado = await sequelize.transaction(async (t) => {
        const [tentativa] = await UserQuiz.findOrCreate({
          where: { userId: req.session.usuario.id, quizId: quiz.id },
          defaults: { grade: 0, progress: 0, completed: false },
          transaction: t,
        });

        const jaRespondida = await Answer.findOne({
          where: { userQuizId: tentativa.id, questionId },
          transaction: t,
        });
        if (jaRespondida) {
          const erroDuplicado = new Error('Esta questão já foi respondida e não pode ser alterada.');
          erroDuplicado.status = 409;
          throw erroDuplicado;
        }

        const resposta = await Answer.create(
          {
            userQuizId: tentativa.id,
            questionId,
            alternativeId: alternativaEscolhida.id,
            answer: alternativaEscolhida.text,
            correct: alternativaEscolhida.correct,
          },
          { transaction: t }
        );

        tentativa.progress += 1;
        if (alternativaEscolhida.correct) {
          tentativa.grade += PONTOS_POR_ACERTO;
        }

        const concluidoAgora = !tentativa.completed && tentativa.progress >= totalQuestoes;
        if (concluidoAgora) {
          tentativa.completed = true;
        }
        await tentativa.save({ transaction: t });

        // RF07 - soma a pontuação do quiz aos pontos do usuário só quando
        // ele termina o quiz pela primeira vez (evita somar de novo caso
        // ele reabra o quiz já concluído).
        if (concluidoAgora) {
          const usuario = await User.findByPk(req.session.usuario.id, { transaction: t });
          usuario.points += tentativa.grade;
          await usuario.save({ transaction: t });
        }

        return { resposta, tentativa, concluidoAgora };
      });
    } catch (erroTransacao) {
      if (erroTransacao.status === 409) {
        return res.status(409).json({ erro: erroTransacao.message });
      }
      throw erroTransacao;
    }

    const alternativaCorreta = quiz.quizQuestions.length
      ? await Alternative.findOne({ where: { questionId, correct: true } })
      : null;

    res.status(201).json({
      correta: resultado.resposta.correct,
      alternativaCorretaId: alternativaCorreta ? alternativaCorreta.id : null,
      resolucao: (await Question.findByPk(questionId))?.explanation || '',
      progresso: resultado.tentativa.progress,
      pontuacao: resultado.tentativa.grade,
      concluido: resultado.tentativa.completed,
    });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
