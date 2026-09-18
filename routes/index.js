var express = require('express');
var router = express.Router();
const crypto = require('crypto');
const { User } = require('../models');
const UserProfile = require('../models/enums/UserProfile');
const { exigirLogin } = require('../middlewares/auth');
const { enviarEmailRecuperacaoSenha } = require('../services/brevoMailer');

const VALIDADE_TOKEN_MS = 60 * 60 * 1000; // 1 hora

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

/* GET tela "esqueci minha senha" */
router.get('/esqueci-senha', function (req, res) {
  if (req.session.usuario) return res.redirect('/');
  res.render('esqueci-senha', { layout: false });
});

/* POST processa o pedido de recuperação de senha - envia e-mail via Brevo.
   Sempre responde com a mesma mensagem de sucesso, exista ou não o e-mail
   na base, para não revelar quais e-mails estão cadastrados. */
router.post('/esqueci-senha', async function (req, res, next) {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).render('esqueci-senha', {
      layout: false,
      erro: 'Informe o seu e-mail cadastrado.',
    });
  }

  const mensagemSucesso =
    'Se este e-mail estiver cadastrado, enviaremos um link de redefinição de senha em instantes. Verifique também a caixa de spam.';

  try {
    const usuario = await User.findByEmail(email.trim().toLowerCase());

    if (usuario && !usuario.excluido) {
      const token = crypto.randomBytes(32).toString('hex');
      usuario.resetPasswordToken = token;
      usuario.resetPasswordExpires = new Date(Date.now() + VALIDADE_TOKEN_MS);
      await usuario.save();

      const link = `${req.protocol}://${req.get('host')}/redefinir-senha/${token}`;

      try {
        await enviarEmailRecuperacaoSenha({ email: usuario.email, nome: usuario.name, link });
      } catch (erroEnvio) {
        // Não expõe detalhes do provedor de e-mail ao usuário; apenas loga
        // no servidor para diagnóstico.
        console.error('Falha ao enviar e-mail de recuperação de senha:', erroEnvio.message);
      }
    }

    res.render('esqueci-senha', { layout: false, sucesso: mensagemSucesso });
  } catch (erro) {
    next(erro);
  }
});

/* GET tela de redefinição de senha (a partir do link recebido por e-mail) */
router.get('/redefinir-senha/:token', async function (req, res, next) {
  try {
    const usuario = await User.findByValidResetToken(req.params.token);

    if (!usuario) {
      return res.status(400).render('redefinir-senha', {
        layout: false,
        tokenInvalido: true,
      });
    }

    res.render('redefinir-senha', { layout: false, token: req.params.token });
  } catch (erro) {
    next(erro);
  }
});

/* POST processa a nova senha definida pelo usuário */
router.post('/redefinir-senha/:token', async function (req, res, next) {
  const { senha, confirmarSenha } = req.body;
  const token = req.params.token;

  try {
    const usuario = await User.findByValidResetToken(token);

    if (!usuario) {
      return res.status(400).render('redefinir-senha', { layout: false, tokenInvalido: true });
    }

    if (!senha || !confirmarSenha) {
      return res.status(400).render('redefinir-senha', {
        layout: false,
        token,
        erro: 'Preencha a nova senha nos dois campos.',
      });
    }

    if (senha !== confirmarSenha) {
      return res.status(400).render('redefinir-senha', {
        layout: false,
        token,
        erro: 'As senhas informadas não coincidem.',
      });
    }

    usuario.password = senha; // RN02 - validado/hasheado pelos hooks do model
    usuario.resetPasswordToken = null;
    usuario.resetPasswordExpires = null;
    await usuario.save();

    res.render('login', {
      layout: false,
      sucesso: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
    });
  } catch (erro) {
    if (erro.name === 'SequelizeValidationError') {
      return res.status(400).render('redefinir-senha', {
        layout: false,
        token,
        erro: erro.errors[0]?.message || 'Não foi possível redefinir a senha.',
      });
    }
    next(erro);
  }
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

/* GET tela do quiz - RF06. Precisa estar logado (o progresso é salvo por
   usuário) e usa o layout padrão do site (mesma sidebar das outras telas). */
router.get('/quizz', exigirLogin, function (req, res, next) {
  res.render('quizz', { title: 'Quiz' });
});

module.exports = router;
