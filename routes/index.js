var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET landing page (tela inicial pública) */
router.get('/inicio', function(req, res, next) {
  res.render('landing', { layout: false });
});

/* GET tela de login */
router.get('/login', function(req, res, next) {
  res.render('login', { layout: false });
});

/* POST processar login
   OBS: ainda não existe uma base de usuários/autenticação real no projeto.
   Por enquanto só redireciona para a Home; troque isso pela checagem de
   e-mail/senha assim que houver um model de usuários. */
router.post('/login', function(req, res, next) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).render('login', {
      layout: false,
      erro: 'Preencha e-mail e senha.'
    });
  }

  // TODO: validar credenciais de verdade aqui
  res.redirect('/');
});

/* GET tela de cadastro */
router.get('/cadastro', function(req, res, next) {
  res.render('cadastro', { layout: false });
});

/* POST processar cadastro
   OBS: mesmo caso do login — ainda falta persistir o usuário de verdade. */
router.post('/cadastro', function(req, res, next) {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).render('cadastro', {
      layout: false,
      erro: 'Preencha todos os campos.'
    });
  }

  // TODO: salvar o novo usuário de verdade aqui
  res.redirect('/login');
});

/* GET tela do quiz */
router.get('/quizz', function(req, res, next) {
  res.render('quizz', { layout: false });
});

module.exports = router;
