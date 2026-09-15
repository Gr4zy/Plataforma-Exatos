var express = require('express');
var router = express.Router();
const { Lesson, Attachment, UserLesson } = require('../models');
const LessonStatus = require('../models/enums/LessonStatus');
const { exigirLogin } = require('../middlewares/auth');
const { lessonToAula } = require('./mappers');

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

module.exports = router;
