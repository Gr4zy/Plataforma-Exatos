var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var multer = require('multer');

const {
  listarAulas,
  buscarAulaPorId,
  adicionarAula,
  atualizarAula,
  removerAula
} = require('../data/aulas');

// Pasta onde os PDFs de material escrito ficam salvos
const pastaMateriais = path.join(__dirname, '..', 'public', 'uploads', 'materiais');
fs.mkdirSync(pastaMateriais, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, pastaMateriais);
  },
  filename: function (req, file, cb) {
    const nomeUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
    cb(null, nomeUnico);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos para o material escrito.'));
    }
  }
});

/* GET /admin/aulas -> tela de cadastro */
router.get('/aulas', function (req, res) {
  res.render('admin/aulas', { title: 'Cadastrar Aula' });
});

/* GET /admin/aulas/api/aulas -> lista aulas cadastradas (JSON) */
router.get('/aulas/api/aulas', function (req, res) {
  res.json(listarAulas());
});

/* POST /admin/aulas/api/aulas -> cria uma nova aula (com PDF opcional) */
router.post('/aulas/api/aulas', function (req, res) {
  upload.single('material')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ erro: err.message });
    }

    const { titulo, subtitulo, descricao, link, nivel } = req.body;

    if (!titulo || !descricao || !link) {
      return res.status(400).json({ erro: 'Título, descrição e URL da aula são obrigatórios.' });
    }

    const materialUrl = req.file
      ? `/uploads/materiais/${req.file.filename}`
      : null;

    const novaAula = adicionarAula({
      titulo,
      subtitulo,
      descricao,
      link,
      nivel,
      materialUrl
    });

    res.status(201).json(novaAula);
  });
});

/* GET /admin/aulas/api/aulas/:id -> retorna uma aula específica (usado para preencher o form de edição) */
router.get('/aulas/api/aulas/:id', function (req, res) {
  const aula = buscarAulaPorId(req.params.id);
  if (!aula) {
    return res.status(404).json({ erro: 'Aula não encontrada.' });
  }
  res.json(aula);
});

/* PUT /admin/aulas/api/aulas/:id -> edita uma aula existente (PDF opcional: só troca se um novo for enviado) */
router.put('/aulas/api/aulas/:id', function (req, res) {
  upload.single('material')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ erro: err.message });
    }

    const aulaExistente = buscarAulaPorId(req.params.id);
    if (!aulaExistente) {
      return res.status(404).json({ erro: 'Aula não encontrada.' });
    }

    const { titulo, subtitulo, descricao, link, nivel } = req.body;

    if (!titulo || !descricao || !link) {
      return res.status(400).json({ erro: 'Título, descrição e URL da aula são obrigatórios.' });
    }

    // Se um novo PDF foi enviado, apaga o antigo (se existir) e usa o novo caminho.
    // Se não foi enviado nada, materialUrl fica undefined e a função de update mantém o atual.
    let materialUrl;
    if (req.file) {
      if (aulaExistente.materialUrl) {
        const caminhoAntigo = path.join(__dirname, '..', 'public', aulaExistente.materialUrl);
        fs.unlink(caminhoAntigo, () => {}); // ignora erro se o arquivo não existir
      }
      materialUrl = `/uploads/materiais/${req.file.filename}`;
    }

    const aulaAtualizada = atualizarAula(req.params.id, {
      titulo,
      subtitulo,
      descricao,
      link,
      nivel,
      materialUrl
    });

    res.json(aulaAtualizada);
  });
});

/* DELETE /admin/aulas/api/aulas/:id -> remove uma aula */
router.delete('/aulas/api/aulas/:id', function (req, res) {
  const removido = removerAula(req.params.id);
  if (!removido) {
    return res.status(404).json({ erro: 'Aula não encontrada.' });
  }
  res.status(204).send();
});

module.exports = router;
