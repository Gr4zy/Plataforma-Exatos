// Middlewares de autenticação/autorização por perfil (RN04)
// RN04 - apenas administradores e bolsistas criam, editam ou excluem
//        conteúdos; alunos possuem acesso restrito ao consumo.
const UserProfile = require('../models/enums/UserProfile');

function exigirLogin(req, res, next) {
  if (!req.session.usuario) {
    if (req.originalUrl.startsWith('/admin')) {
      return res.status(401).json({ erro: 'É necessário estar autenticado.' });
    }
    return res.redirect('/login');
  }
  next();
}

function exigirGestor(req, res, next) {
  const usuario = req.session.usuario;
  if (!usuario) {
    return res.status(401).json({ erro: 'É necessário estar autenticado.' });
  }
  if (usuario.perfil !== UserProfile.SCHOLAR && usuario.perfil !== UserProfile.ADMIN) {
    return res.status(403).json({ erro: 'Apenas bolsistas e administradores podem gerenciar este conteúdo.' });
  }
  next();
}

function exigirAdmin(req, res, next) {
  const usuario = req.session.usuario;
  if (!usuario) {
    return res.status(401).json({ erro: 'É necessário estar autenticado.' });
  }
  if (usuario.perfil !== UserProfile.ADMIN) {
    return res.status(403).json({ erro: 'Apenas administradores têm acesso a este recurso.' });
  }
  next();
}

function exigirGestorPagina(req, res, next) {
  const usuario = req.session.usuario;
  if (!usuario) {
    return res.redirect('/login');
  }
  if (usuario.perfil !== UserProfile.SCHOLAR && usuario.perfil !== UserProfile.ADMIN) {
    return res.status(403).render('error', {
      message: 'Acesso restrito a bolsistas e administradores.',
      error: {},
    });
  }
  next();
}

module.exports = { exigirLogin, exigirGestor, exigirGestorPagina, exigirAdmin };
