// data/aulas.js
// Armazenamento em memória das aulas cadastradas.
// (Se o projeto já usa banco de dados, substitua este módulo pelas
// chamadas ao model/DB, mantendo a mesma assinatura das funções abaixo.)

let listaDeAulas = [
  {
    id: 1,
    subtitulo: "Álgebra",
    titulo: "Função do 1º Grau (Introdução)",
    descricao: "Aprenda o conceito inicial de função afim, gráfico, coeficiente angular e linear.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Básico",
    materialUrl: "/uploads/materiais/1787092825332-971659280.pdf"
  },
  {
    id: 2,
    subtitulo: "Equações",
    titulo: "Equação do 2º Grau e Bhaskara",
    descricao: "Domine a fórmula de Bhaskara e aprenda a encontrar as raízes de uma equação quadrática.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Intermediário",
    materialUrl: "/uploads/materiais/1787092825332-971659280.pdf"
  },
  {
    id: 3,
    subtitulo: "Análise Combinatória",
    titulo: "Análise Combinatória: Fatorial",
    descricao: "Entenda os princípios de contagem, arranjo, combinação e agrupamentos matemáticos.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Avançado",
    materialUrl: "/uploads/materiais/1787092825332-971659280.pdf"
  },
  {
    id: 4,
    subtitulo: "Geometria Plana",
    titulo: "Geometria Plana: Áreas de Figuras",
    descricao: "Como calcular a área de quadrados, retângulos, triângulos e círculos sem mistérios.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Básico",
    materialUrl: "/uploads/materiais/1787092825332-971659280.pdf"
  }
];

let proximoId = listaDeAulas.length + 1;

function listarAulas() {
  return listaDeAulas;
}

function buscarAulaPorId(id) {
  return listaDeAulas.find(a => a.id === Number(id));
}

function adicionarAula({ subtitulo, titulo, descricao, link, nivel, materialUrl }) {
  const novaAula = {
    id: proximoId++,
    subtitulo: subtitulo || "",
    titulo,
    descricao,
    link,
    nivel: nivel || "Básico",
    materialUrl: materialUrl || null
  };
  listaDeAulas.push(novaAula);
  return novaAula;
}

function atualizarAula(id, { subtitulo, titulo, descricao, link, nivel, materialUrl }) {
  const aula = buscarAulaPorId(id);
  if (!aula) return null;

  aula.subtitulo = subtitulo || "";
  aula.titulo = titulo;
  aula.descricao = descricao;
  aula.link = link;
  aula.nivel = nivel || "Básico";

  // Só troca o material se um novo PDF foi enviado (undefined = manter o atual)
  if (materialUrl !== undefined) {
    aula.materialUrl = materialUrl;
  }

  return aula;
}

function removerAula(id) {
  const indice = listaDeAulas.findIndex(a => a.id === Number(id));
  if (indice === -1) return false;
  listaDeAulas.splice(indice, 1);
  return true;
}

module.exports = {
  listarAulas,
  buscarAulaPorId,
  adicionarAula,
  atualizarAula,
  removerAula
};
