let listaDeAulas = [
  {
    id: 1,
    subtitulo: "Álgebra",
    titulo: "Função do 1º Grau (Introdução)",
    descricao: "Aprenda o conceito inicial de função afim, gráfico, coeficiente angular e linear.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Básico",
    materiais: [] 
  },
  {
    id: 2,
    subtitulo: "Equações",
    titulo: "Equação do 2º Grau e Bhaskara",
    descricao: "Domine a fórmula de Bhaskara e aprenda a encontrar as raízes de uma equação quadrática.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Intermediário",
    materiais: []
  },
  {
    id: 3,
    subtitulo: "Análise Combinatória",
    titulo: "Análise Combinatória: Fatorial",
    descricao: "Entenda os princípios de contagem, arranjo, combinação e agrupamentos matemáticos.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Avançado",
    materiais: []
  },
  {
    id: 4,
    subtitulo: "Geometria Plana",
    titulo: "Geometria Plana: Áreas de Figuras",
    descricao: "Como calcular a área de quadrados, retângulos, triângulos e círculos sem mistérios.",
    link: "https://youtu.be/tfiHm1cbxe4?si=ehmHJJVkuFeoSNRQ",
    nivel: "Básico",
    materiais: []
  }
];

let proximoId = listaDeAulas.length + 1;

function listarAulas() {
  return listaDeAulas;
}

function buscarAulaPorId(id) {
  return listaDeAulas.find(a => a.id === Number(id));
}

// Normaliza a lista de materiais recebida do front (remove itens vazios/incompletos)
function normalizarMateriais(materiais) {
  if (!Array.isArray(materiais)) return [];
  return materiais
    .filter(m => m && m.url && m.url.trim() !== "")
    .map(m => ({
      titulo: (m.titulo && m.titulo.trim()) || "Material",
      url: m.url.trim()
    }));
}

function adicionarAula({ subtitulo, titulo, descricao, link, nivel, materiais }) {
  const novaAula = {
    id: proximoId++,
    subtitulo: subtitulo || "",
    titulo,
    descricao,
    link,
    nivel: nivel || "Básico",
    materiais: normalizarMateriais(materiais)
  };
  listaDeAulas.push(novaAula);
  return novaAula;
}

function atualizarAula(id, { subtitulo, titulo, descricao, link, nivel, materiais }) {
  const aula = buscarAulaPorId(id);
  if (!aula) return null;

  aula.subtitulo = subtitulo || "";
  aula.titulo = titulo;
  aula.descricao = descricao;
  aula.link = link;
  aula.nivel = nivel || "Básico";
  aula.materiais = normalizarMateriais(materiais);

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
