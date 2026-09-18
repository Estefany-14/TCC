-- ============================================
-- BANCO DE DADOS: conecta_plus
-- TABELA: usuarios
-- ============================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS conecta_plus
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE conecta_plus;

-- Criar tabela de usuários
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
  data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir usuários de teste (opcional)
INSERT INTO usuarios (nome, email, senha, cpf, telefone, endereco, cidade, uf, interesse) VALUES
('Estefany Aluna', 'aluno@conecta.com', '123456', '123.456.789-00', '(11) 98765-4321', 'Rua Principal, 100', 'São Paulo', 'SP', 'Cursos de informática'),
('Maria Julia Silva', 'maria@email.com', '123456', '987.654.321-99', '(11) 91234-5678', 'Av. Brasil, 500', 'São Paulo', 'SP', 'Conteúdos em Libras')
ON DUPLICATE KEY UPDATE email=email;

-- Consulta para verificar os usuários cadastrados
SELECT id, nome, email, cpf, telefone, cidade, uf, interesse, data_cadastro 
FROM usuarios 
ORDER BY data_cadastro DESC;
