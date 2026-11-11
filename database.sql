-- ==============================================================
-- BANCO DE DADOS: conecta_plus (Projeto TCC Conecta+)
-- ESTRUTURA RELACIONAL COMPLETA (6 TABELAS CONECTADAS)
-- ==============================================================

-- 1. Criar o banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS conecta_plus
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 2. Selecionar o banco de dados
USE conecta_plus;

-- Desativar verificação de chaves temporariamente para recriação limpa (opcional)
SET FOREIGN_KEY_CHECKS = 0;

-- Dropar tabelas se já existirem (caso queira reiniciar o banco)
-- DROP TABLE IF EXISTS avaliacoes_produtos;
-- DROP TABLE IF EXISTS itens_pedido;
-- DROP TABLE IF EXISTS pedidos;
-- DROP TABLE IF EXISTS produtos;
-- DROP TABLE IF EXISTS categorias;
-- DROP TABLE IF EXISTS usuarios;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================
-- TABELA 1: usuarios (Cadastro de Usuários e Administradores)
-- ==============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  cpf VARCHAR(14),
  telefone VARCHAR(20),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  uf CHAR(2),
  interesse VARCHAR(100),
  tipo VARCHAR(20) DEFAULT 'usuario', -- 'usuario' ou 'admin'
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- TABELA 2: categorias (Categorias dos Produtos e Serviços)
-- ==============================================================
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao TEXT,
  icone VARCHAR(50) DEFAULT '📦',
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- TABELA 3: produtos (Catálogo de Produtos, Cursos e Tecnologias)
-- Chave Estrangeira: categoria_id -> categorias(id)
-- ==============================================================
CREATE TABLE IF NOT EXISTS produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estoque INT NOT NULL DEFAULT 0,
  imagem_url VARCHAR(500),
  tipo VARCHAR(50) DEFAULT 'produto', -- 'produto', 'curso', 'servico'
  ativo BOOLEAN DEFAULT TRUE,
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categoria (categoria_id),
  CONSTRAINT fk_produtos_categorias
    FOREIGN KEY (categoria_id) 
    REFERENCES categorias (id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- TABELA 4: pedidos (Registro de Pedidos e Solicitações de Usuários)
-- Chave Estrangeira: usuario_id -> usuarios(id)
-- ==============================================================
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  data_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'Pendente', -- 'Pendente', 'Aprovado', 'Enviado', 'Entregue', 'Cancelado'
  valor_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  forma_pagamento VARCHAR(50) DEFAULT 'Boleto Bancário', -- 'Cartão de Crédito', 'Pix', 'Boleto Bancário', 'Gratuito'
  endereco_entrega VARCHAR(255),
  INDEX idx_usuario (usuario_id),
  CONSTRAINT fk_pedidos_usuarios
    FOREIGN KEY (usuario_id) 
    REFERENCES usuarios (id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- TABELA 5: itens_pedido (TABELA QUE CONECTA PRODUTOS AOS PEDIDOS - Relação N:N)
-- Chaves Estrangeiras: pedido_id -> pedidos(id) e produto_id -> produtos(id)
-- ==============================================================
CREATE TABLE IF NOT EXISTS itens_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  produto_id INT NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  INDEX idx_pedido (pedido_id),
  INDEX idx_produto (produto_id),
  CONSTRAINT fk_itens_pedidos
    FOREIGN KEY (pedido_id) 
    REFERENCES pedidos (id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_itens_produtos
    FOREIGN KEY (produto_id) 
    REFERENCES produtos (id) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================
-- TABELA 6: avaliacoes_produtos (Feedback e Avaliações de Produtos pelos Usuários)
-- Chaves Estrangeiras: usuario_id -> usuarios(id) e produto_id -> produtos(id)
-- ==============================================================
CREATE TABLE IF NOT EXISTS avaliacoes_produtos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  produto_id INT NOT NULL,
  nota INT NOT NULL CHECK (nota BETWEEN 1 AND 5),
  comentario TEXT,
  data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_avaliacao_usuario (usuario_id),
  INDEX idx_avaliacao_produto (produto_id),
  CONSTRAINT fk_avaliacoes_usuarios
    FOREIGN KEY (usuario_id) 
    REFERENCES usuarios (id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE,
  CONSTRAINT fk_avaliacoes_produtos
    FOREIGN KEY (produto_id) 
    REFERENCES produtos (id) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==============================================================
-- CARGA DE DADOS INICIAIS (INSERTS DE TESTE PARA APRESENTAÇÃO)
-- ==============================================================

-- 1. Inserir Usuários (Admin e Alunos)
INSERT INTO usuarios (nome, email, senha, cpf, telefone, endereco, cidade, uf, interesse, tipo) VALUES
('Administrador Conecta+', 'admin@conecta.com', 'admin123', '000.000.000-00', '(11) 90000-0000', 'Central Conecta+', 'São Paulo', 'SP', 'Gestão do Sistema', 'admin'),
('Estefany Aluna', 'aluno@conecta.com', '123456', '123.456.789-00', '(11) 98765-4321', 'Rua Principal, 100', 'São Paulo', 'SP', 'Cursos de informática', 'usuario'),
('Maria Julia Silva', 'maria@email.com', '123456', '987.654.321-99', '(11) 91234-5678', 'Av. Brasil, 500', 'São Paulo', 'SP', 'Conteúdos em Libras', 'usuario'),
('Carlos Eduardo Souza', 'carlos@email.com', '123456', '333.444.555-66', '(11) 97777-8888', 'Rua das Flores, 45', 'São Bernardo do Campo', 'SP', 'Empregos e vagas', 'usuario')
ON DUPLICATE KEY UPDATE email=email;

-- 2. Inserir Categorias de Produtos/Serviços
INSERT INTO categorias (id, nome, descricao, icone) VALUES
(1, 'Tecnologia Assistiva', 'Dispositivos e ferramentas para acessibilidade física, visual e auditiva', '♿'),
(2, 'Cursos e Treinamentos', 'Capacitação digital, informática do zero e módulos inclusivos', '💻'),
(3, 'Periféricos e Acessórios', 'Teclados adaptados, mouses ergonômicos e acessórios de informática', '⌨️'),
(4, 'Materiais em Libras', 'Guias, apostilas e cursos voltados para a comunidade surda', '🤟')
ON DUPLICATE KEY UPDATE nome=nome;

-- 3. Inserir Produtos
INSERT INTO produtos (id, categoria_id, nome, descricao, preco, estoque, tipo) VALUES
(1, 1, 'Teclado com Caracteres Ampliados', 'Teclado de alto contraste com teclas grandes para pessoas com baixa visão.', 120.00, 15, 'produto'),
(2, 1, 'Mouse Ergonômico Vertical Adaptado', 'Mouse anatômico para redução de esforço repetitivo e controle facilitado.', 89.90, 25, 'produto'),
(3, 2, 'Curso de Informática Básica para Iniciantes', 'Curso completo passo a passo com videoaulas e suporte individual.', 0.00, 999, 'curso'),
(4, 2, 'Pacote Office e Ferramentas Digitais', 'Treinamento em Word, Excel e navegadores de internet com foco em empregabilidade.', 0.00, 999, 'curso'),
(5, 4, 'Dicionário Digital e Guia Prático de Libras', 'Material digital interativo com mais de 1000 sinais e expressões cotidianas.', 45.00, 50, 'produto'),
(6, 3, 'Headset com Microfone e Redutor de Ruído', 'Fones acolchoados para videochamadas, aulas online e atendimento acessível.', 79.90, 30, 'produto')
ON DUPLICATE KEY UPDATE nome=nome;

-- 4. Inserir Pedidos
INSERT INTO pedidos (id, usuario_id, status, valor_total, forma_pagamento, endereco_entrega) VALUES
(1, 2, 'Entregue', 120.00, 'Pix', 'Rua Principal, 100 - São Paulo/SP'),
(2, 3, 'Aprovado', 45.00, 'Cartão de Crédito', 'Av. Brasil, 500 - São Paulo/SP'),
(3, 4, 'Pendente', 169.80, 'Boleto Bancário', 'Rua das Flores, 45 - São Bernardo do Campo/SP')
ON DUPLICATE KEY UPDATE id=id;

-- 5. Inserir Itens do Pedido (Conexão Pedido <-> Produto)
INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario, subtotal) VALUES
(1, 1, 1, 120.00, 120.00), -- Pedido 1 comprou 1 Teclado Ampliado
(2, 5, 1, 45.00, 45.00),   -- Pedido 2 comprou 1 Guia de Libras
(3, 2, 1, 89.90, 89.90),   -- Pedido 3 comprou 1 Mouse Ergonômico
(3, 6, 1, 79.90, 79.90);   -- Pedido 3 comprou 1 Headset

-- 6. Inserir Avaliações dos Produtos pelos Usuários
INSERT INTO avaliacoes_produtos (usuario_id, produto_id, nota, comentario) VALUES
(2, 1, 5, 'Excelente teclado! As teclas são bem nítidas e facilitou muito meu estudo.'),
(3, 5, 5, 'Material de ótima qualidade, muito didático e acessível.'),
(4, 2, 4, 'Mouse muito confortável, diminuiu bastante o cansaço no pulso.');


-- ==============================================================
-- CONSULTAS DE EXEMPLO COM JOINS (ÓTIMAS PARA SLIDES E DEMONSTRAÇÃO DO TCC)
-- ==============================================================

-- Consulta 1: Listar produtos com o nome de sua categoria (JOIN produtos e categorias)
SELECT 
  p.id AS codigo_produto,
  p.nome AS produto,
  c.nome AS categoria,
  p.preco,
  p.estoque,
  p.tipo
FROM produtos p
INNER JOIN categorias c ON p.categoria_id = c.id
ORDER BY p.id;

-- Consulta 2: Relatório de pedidos com dados do cliente (JOIN pedidos e usuarios)
SELECT 
  ped.id AS numero_pedido,
  u.nome AS cliente,
  u.email,
  ped.data_pedido,
  ped.status,
  ped.forma_pagamento,
  ped.valor_total
FROM pedidos ped
INNER JOIN usuarios u ON ped.usuario_id = u.id
ORDER BY ped.data_pedido DESC;

-- Consulta 3: Detalhes completos dos itens comprados em cada pedido (JOIN pedidos, itens_pedido e produtos)
SELECT 
  ped.id AS pedido_id,
  u.nome AS cliente,
  prod.nome AS produto_comprado,
  item.quantidade,
  item.preco_unitario,
  item.subtotal
FROM itens_pedido item
INNER JOIN pedidos ped ON item.pedido_id = ped.id
INNER JOIN usuarios u ON ped.usuario_id = u.id
INNER JOIN produtos prod ON item.produto_id = prod.id
ORDER BY ped.id;

-- Consulta 4: Média de avaliações por produto (JOIN produtos e avaliacoes_produtos)
SELECT 
  p.nome AS produto,
  ROUND(AVG(a.nota), 1) AS media_estrelas,
  COUNT(a.id) AS total_avaliacoes
FROM produtos p
LEFT JOIN avaliacoes_produtos a ON p.id = a.produto_id
GROUP BY p.id, p.nome
ORDER BY media_estrelas DESC;
