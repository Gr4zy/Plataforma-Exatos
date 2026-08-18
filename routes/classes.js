var express = require('express');
var router = express.Router();
const { listarAulas } = require('../data/aulas');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// Retorna as aulas em formato JSON
router.get('/api/aulas', (request, response) => {
  response.json(listarAulas());
});

module.exports = router;
