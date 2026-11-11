const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('📦 Body:', req.body);
  next();
});

// Configuração da conexão MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'conecta_plus'
};

// Pool de conexões
const pool = mysql.createPool(dbConfig);

// Testar conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conectado ao MySQL com sucesso!');
    connection.release();
  } catch (error) {
    console.error('❌ Erro ao conectar ao MySQL:', error.message);
  }
}

testConnection();

// Rota para cadastrar usuário
app.post('/api/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, cpf, telefone, endereco, cidade, uf, interesse } = req.body;

    // Validação básica
    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Nome, email e senha são obrigatórios' 
      });
    }

    // Verificar se email já existe
    const [existingUsers] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Este e-mail já está cadastrado' 
      });
    }

    // Inserir novo usuário
    const [result] = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, cpf, telefone, endereco, cidade, uf, interesse, data_cadastro)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [nome, email, senha, cpf || null, telefone || null, endereco || null, cidade || null, uf || null, interesse || null]
    );

    res.status(201).json({ 
      sucesso: true, 
      mensagem: 'Cadastro realizado com sucesso!',
      usuarioId: result.insertId
    });

  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao realizar cadastro. Tente novamente.' 
    });
  }
});

// Rota para login
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ 
        sucesso: false, 
        mensagem: 'Email e senha são obrigatórios' 
      });
    }

    const [users] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND senha = ?',
      [email, senha]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        sucesso: false, 
        mensagem: 'Email ou senha incorretos' 
      });
    }

    const usuario = users[0];
    res.status(200).json({ 
      sucesso: true, 
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf,
        telefone: usuario.telefone,
        endereco: usuario.endereco,
        cidade: usuario.cidade,
        uf: usuario.uf,
        interesse: usuario.interesse,
        tipo: usuario.tipo || 'usuario',
        dataCadastro: usuario.data_cadastro
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ 
      sucesso: false, 
      mensagem: 'Erro ao fazer login. Tente novamente.' 
    });
  }
});

// Rota para listar usuários
app.get('/api/usuarios', async (req, res) => {
  try {
    const [usuarios] = await pool.query(
      'SELECT id, nome, email, cpf, telefone, endereco, cidade, uf, interesse, tipo, data_cadastro FROM usuarios ORDER BY id DESC'
    );
    res.status(200).json({ sucesso: true, usuarios });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar usuários' });
  }
});

// Rota para excluir um usuário (para o admin)
app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Evitar excluir o admin principal
    const [user] = await pool.query('SELECT email FROM usuarios WHERE id = ?', [id]);
    if (user.length > 0 && user[0].email === 'admin@conecta.com') {
      return res.status(400).json({ sucesso: false, mensagem: 'Não é possível excluir o administrador principal.' });
    }

    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.status(200).json({ sucesso: true, mensagem: 'Usuário removido com sucesso!' });
    } else {
      res.status(404).json({ sucesso: false, mensagem: 'Usuário não encontrado.' });
    }
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao excluir usuário.' });
  }
});

// Rota para estatísticas do painel admin
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM usuarios');
    const [interests] = await pool.query('SELECT interesse, COUNT(*) as count FROM usuarios GROUP BY interesse');
    const [recents] = await pool.query('SELECT id, nome, email, tipo, data_cadastro FROM usuarios ORDER BY id DESC LIMIT 5');
    
    res.status(200).json({
      sucesso: true,
      stats: {
        total: totalUsers[0].total,
        interesses: interests,
        recentes: recents
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao obter estatísticas.' });
  }
});

// ==========================================
// ROTAS PARA PRODUTOS, CATEGORIAS E PEDIDOS
// ==========================================

// Rota para listar produtos com suas categorias
app.get('/api/produtos', async (req, res) => {
  try {
    const [produtos] = await pool.query(`
      SELECT 
        p.id, p.nome, p.descricao, p.preco, p.estoque, p.imagem_url, p.tipo, p.ativo, p.data_cadastro,
        c.id as categoria_id, c.nome as categoria_nome, c.icone as categoria_icone
      FROM produtos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.ativo = TRUE
      ORDER BY p.id DESC
    `);
    res.status(200).json({ sucesso: true, produtos });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar produtos.' });
  }
});

// Rota para listar categorias
app.get('/api/categorias', async (req, res) => {
  try {
    const [categorias] = await pool.query('SELECT * FROM categorias WHERE ativo = TRUE ORDER BY nome ASC');
    res.status(200).json({ sucesso: true, categorias });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar categorias.' });
  }
});

// Rota para listar pedidos com dados dos clientes
app.get('/api/pedidos', async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT 
        ped.id, ped.data_pedido, ped.status, ped.valor_total, ped.forma_pagamento, ped.endereco_entrega,
        u.id as usuario_id, u.nome as cliente_nome, u.email as cliente_email
      FROM pedidos ped
      INNER JOIN usuarios u ON ped.usuario_id = u.id
      ORDER BY ped.data_pedido DESC
    `);
    res.status(200).json({ sucesso: true, pedidos });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar pedidos.' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});
