require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');

var indexRouter = require('./routes/index');
var classesRouter = require('./routes/classes');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/Admin');
var perfilRouter = require('./routes/perfil');
var { User } = require('./models');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// RF01 - sessão do usuário autenticado (login/logout)
app.use(session({
  secret: process.env.SESSION_SECRET || 'plataforma-exatos-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 horas
}));

// Mantém a sessão em sincronia com o banco: se o administrador mudar o
// perfil de alguém (ex.: aluno -> bolsista) ou desativar a conta, isso vale
// na próxima requisição, sem precisar sair e entrar de novo.
app.use(async function (req, res, next) {
  if (!req.session.usuario) return next();
  try {
    const atual = await User.findByPk(req.session.usuario.id, {
      attributes: ['id', 'name', 'email', 'profile', 'excluido'],
    });
    if (!atual || atual.excluido) {
      return req.session.destroy(() => res.redirect('/login'));
    }
    req.session.usuario.nome = atual.name;
    req.session.usuario.perfil = atual.profile;
    next();
  } catch (erro) {
    next(erro);
  }
});

// Deixa o usuário logado (sem a senha) disponível em todas as views
app.use(function (req, res, next) {
  res.locals.usuarioLogado = req.session.usuario || null;
  next();
});

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/classes', classesRouter);
app.use('/perfil', perfilRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var db = require('./models');
// Sem migrations: quando os models mudarem (novas colunas/tabelas), apague
// o database.sqlite e rode `npm run seed` de novo. NÃO use `alter: true`
// aqui: no SQLite ele recria as tabelas por baixo dos panos e, em testes,
// isso já resetou colunas de chave estrangeira (como Quiz.lessonId) que só
// existiam via associação - perdendo dados nas tabelas relacionadas a quiz.
db.sequelize.sync().then(async () => {
  console.log('Banco de dados sincronizado!');
  try {
    // Adiciona colunas novas (ex.: imagens) em bancos antigos sem apagar dados.
    await require('./scripts/ensureSchema')();
  } catch (erro) {
    console.error('Falha ao atualizar o esquema do banco de dados:', erro.message);
  }
  try {
    const seed = require('./scripts/seed');
    await seed();
  } catch (erro) {
    console.error('Falha ao semear o banco de dados:', erro.message);
  }
});

module.exports = app;

const hbs = require('hbs');
hbs.registerPartials(__dirname + '/views/partials');

const UserProfile = require('./models/enums/UserProfile');

hbs.registerHelper('ehAdmin', function (perfil) {
  return perfil === UserProfile.ADMIN;
});

hbs.registerHelper('ehGestor', function (perfil) {
  return perfil === UserProfile.SCHOLAR || perfil === UserProfile.ADMIN;
});
