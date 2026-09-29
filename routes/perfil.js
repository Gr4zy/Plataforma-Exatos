var express = require('express');
var router = express.Router();
const { Op } = require('sequelize');
const { User, Quiz, UserQuiz } = require('../models');
const UserProfile = require('../models/enums/UserProfile');
const { exigirLogin } = require('../middlewares/auth');

const ROTULOS_PERFIL = {
  [UserProfile.STUDENT]: 'Aluno',
  [UserProfile.SCHOLAR]: 'Bolsista',
  [UserProfile.ADMIN]: 'Administrador',
};

function formatarData(data) {
  return data ? new Date(data).toLocaleDateString('pt-BR') : '';
}

/* GET perfil do usuário logado: dados da conta, pontuação (RF07),
   posição no ranking global e histórico dos quizzes. */
router.get('/', exigirLogin, async function (req, res, next) {
  try {
    const usuario = await User.findByPk(req.session.usuario.id);
    if (!usuario) {
      return req.session.destroy(() => res.redirect('/login'));
    }

    // Ranking: posição = 1 + quantidade de usuários ativos com mais pontos.
    // Quem empata em pontos divide a mesma posição.
    const [maisPontos, totalAtivos] = await Promise.all([
      User.count({ where: { excluido: false, points: { [Op.gt]: usuario.points } } }),
      User.count({ where: { excluido: false } }),
    ]);

    const tentativas = await UserQuiz.findAll({
      where: { userId: usuario.id },
      include: [{ model: Quiz }],
      order: [['updatedAt', 'DESC']],
    });

    const historico = tentativas.map((t) => ({
      titulo: t.Quiz ? t.Quiz.title : 'Quiz removido',
      categoria: t.Quiz ? t.Quiz.category : '',
      nota: t.grade,
      respondidas: t.progress,
      concluido: t.completed,
      data: formatarData(t.updatedAt),
    }));

    res.render('perfil', {
      title: 'Meu Perfil',
      perfilNome: usuario.name,
      perfilEmail: usuario.email,
      perfilRotulo: ROTULOS_PERFIL[usuario.profile] || 'Aluno',
      membroDesde: formatarData(usuario.createdAt),
      pontos: usuario.points,
      posicao: maisPontos + 1,
      totalUsuarios: totalAtivos,
      quizzesConcluidos: tentativas.filter((t) => t.completed).length,
      historico,
      temHistorico: historico.length > 0,
    });
  } catch (erro) {
    next(erro);
  }
});

module.exports = router;
