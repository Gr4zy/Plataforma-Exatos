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
var adminRouter = require('./routes/admin');

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

// Deixa o usuário logado (sem a senha) disponível em todas as views
app.use(function (req, res, next) {
  res.locals.usuarioLogado = req.session.usuario || null;
  next();
});

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/classes', classesRouter);
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
db.sequelize.sync().then(async () => {
  console.log('Banco de dados sincronizado!');
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

hbs.registerHelper('ehGestor', function (perfil) {
  return perfil === UserProfile.SCHOLAR || perfil === UserProfile.ADMIN;
});
