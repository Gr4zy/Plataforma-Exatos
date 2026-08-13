var express = require('express');
var router = express.Router();

const listaDeAulas = [
  {
      subtitulo: "Álgebra",
      titulo: "Função do 1º Grau (Introdução)",
      descricao: "Aprenda o conceito inicial de função afim, gráfico, coeficiente angular e linear.",
      link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
      nivel: "Básico"
  },
  {
      subtitulo: "Equações",
      titulo: "Equação do 2º Grau e Bhaskara",
      descricao: "Domine a fórmula de Bhaskara e aprenda a encontrar as raízes de uma equação quadrática.",
      link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
      nivel: "Intermediário"
  },
  {
      subtitulo: "Análise Combinatória",
      titulo: "Análise Combinatória: Fatorial",
      descricao: "Entenda os princípios de contagem, arranjo, combinação e agrupamentos matemáticos.",
      link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
      nivel: "Avançado"
  },
  {
      subtitulo: "Geometria Plana",
      titulo: "Geometria Plana: Áreas de Figuras",
      descricao: "Como calcular a área de quadrados, retângulos, triângulos e círculos sem mistérios.",
      link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
      nivel: "Básico"
  }
];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Retorna as aulas em formato JSON
router.get("/api/aulas", (request, response) => {
  response.json(listaDeAulas);
});

module.exports = router;
