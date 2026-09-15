var express = require('express');
var router = express.Router();
const { User } = require('../models');
const UserProfile = require('../models/enums/UserProfile');

/* GET página inicial: landing pública para visitantes, painel para quem já
   está logado. */
router.get('/', function (req, res, next) {
  if (!req.session.usuario) {
    return res.render('landing', { layout: false });
  }
  res.render('index', { title: 'Início' });
});

/* GET landing page (alias, mesmo conteúdo de "/") */
router.get('/inicio', function (req, res, next) {
  res.render('landing', { layout: false });
});

/* GET tela de login */
router.get('/login', function (req, res, next) {
  if (req.session.usuario) return res.redirect('/');
  res.render('login', { layout: false });
});

/* POST processar login - RF01 */
router.post('/login', async function (req, res, next) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).render('login', {
      layout: false,
      erro: 'Preencha e-mail e senha.',
    });
  }

  try {
    const usuario = await User.findByEmail(email.trim().toLowerCase());

    if (!usuario || !(await usuario.validatePassword(senha))) {
      return res.status(401).render('login', {
        layout: false,
        erro: 'E-mail ou senha inválidos.',
      });
    }

    if (usuario.excluido) {
      return res.status(403).render('login', {
        layout: false,
        erro: 'Esta conta foi desativada. Procure um administrador.',
      });
    }

    // Guarda apenas os dados essenciais na sessão (nunca a senha/hash)
    req.session.usuario = {
      id: usuario.id,
      nome: usuario.name,
      email: usuario.email,
      perfil: usuario.profile,
    };

    res.redirect('/');
  } catch (erro) {
    next(erro);
  }
});

/* GET logout - RF01 */
router.get('/logout', function (req, res) {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

/* GET tela de cadastro */
router.get('/cadastro', function (req, res, next) {
  if (req.session.usuario) return res.redirect('/');
  res.render('cadastro', { layout: false });
});

/* POST processar cadastro - RF01, RN01, RN02, RN03
   O perfil inicial é sempre STUDENT: RN03 impede autopromoção, então o
   campo "perfil" nunca é lido do formulário público de cadastro. */
router.post('/cadastro', async function (req, res, next) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).render('cadastro', {
      layout: false,
      erro: 'Preencha todos os campos.',
    });
  }

  try {
    const emailNormalizado = email.trim().toLowerCase();
    const existente = await User.findByEmail(emailNormalizado);

    if (existente) {
      // RN01 - e-mail único
      return res.status(409).render('cadastro', {
        layout: false,
        nome,
        email,
        erro: 'Este e-mail já está cadastrado.',
      });
    }

    await User.create({
      name: nome.trim(),
      email: emailNormalizado,
      password: senha,
      profile: UserProfile.STUDENT,
    });

    res.redirect('/login');
  } catch (erro) {
    // Erros de validação do Sequelize (ex.: RN02 - senha com no mínimo 6 caracteres)
    if (erro.name === 'SequelizeValidationError' || erro.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).render('cadastro', {
        layout: false,
        nome,
        email,
        erro: erro.errors[0]?.message || 'Não foi possível concluir o cadastro.',
      });
    }
    next(erro);
  }
});

/* GET tela do quiz (demo estática) */
router.get('/quizz', function (req, res, next) {
  res.render('quizz', { layout: false });
});

module.exports = router;
