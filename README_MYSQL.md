# Conecta+ - Integração com MySQL

Este projeto agora está conectado ao MySQL para armazenar os cadastros de usuários.

## 📋 Pré-requisitos

1. **MySQL Server** instalado e rodando
2. **Node.js** instalado
3. Dependências do projeto instaladas (`npm install`)

## 🗄️ Código SQL para criar o banco de dados

Execute o seguinte código SQL no seu MySQL Workbench ou terminal MySQL:

```sql
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
```

## ⚙️ Configuração do Backend

O arquivo `server.js` já está configurado com as seguintes configurações padrão:

- **Host:** localhost
- **Usuário:** root
- **Senha:** (vazio)
- **Banco de dados:** conecta_plus
- **Porta do servidor:** 3000

Se precisar alterar essas configurações, edite o arquivo `server.js`:

```javascript
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'sua_senha_aqui',  // Altere se necessário
  database: 'conecta_plus'
};
```

## 🚀 Como executar

### 1. Inicie o servidor MySQL

Certifique-se de que o MySQL está rodando no seu computador.

### 2. Execute o script SQL

Execute o código SQL acima para criar o banco de dados e a tabela.

### 3. Inicie o backend Node.js

```bash
npm run server
```

O servidor iniciará em `http://localhost:3000`

### 4. Inicie o frontend

Em outro terminal:

```bash
npm start
```

O frontend estará disponível em `http://localhost:8080`

## 📝 Como funciona

1. Quando um usuário se cadastra no formulário (modal ou página), os dados são enviados para o backend via API
2. O backend recebe os dados e os insere no banco de dados MySQL
3. O usuário é salvo no `localStorage` para manter a sessão ativa
4. Você pode verificar os usuários cadastrados no MySQL executando:

```sql
SELECT * FROM usuarios;
```

## 🔧 API Endpoints

### POST /api/cadastro
Cadastra um novo usuário no banco de dados.

**Body:**
```json
{
  "nome": "Nome do Usuário",
  "email": "usuario@email.com",
  "senha": "123456",
  "cpf": "000.000.000-00",
  "telefone": "(11) 00000-0000",
  "endereco": "Rua, número",
  "cidade": "Cidade",
  "uf": "SP",
  "interesse": "Cursos de informática"
}
```

**Resposta de sucesso:**
```json
{
  "sucesso": true,
  "mensagem": "Cadastro realizado com sucesso!",
  "usuarioId": 1
}
```

### POST /api/login
Autentica um usuário.

**Body:**
```json
{
  "email": "usuario@email.com",
  "senha": "123456"
}
```

### GET /api/usuarios
Lista todos os usuários cadastrados (útil para debug).

## 🐛 Solução de problemas

### Erro: "Erro ao conectar com o servidor"
- Verifique se o servidor Node.js está rodando (`npm run server`)
- Verifique se o MySQL está rodando
- Verifique se as credenciais no `server.js` estão corretas

### Erro: "Banco de dados não existe"
- Execute o script SQL fornecido acima
- Verifique se o nome do banco de dados está correto no `server.js`

### Erro: "Acesso negado"
- Verifique se o usuário do MySQL tem permissões
- Altere a senha no `server.js` se necessário

## 📊 Verificando dados no MySQL

Para ver todos os usuários cadastrados:

```sql
USE conecta_plus;
SELECT id, nome, email, cpf, telefone, cidade, uf, interesse, data_cadastro 
FROM usuarios 
ORDER BY data_cadastro DESC;
```

Para contar quantos usuários estão cadastrados:

```sql
SELECT COUNT(*) as total_usuarios FROM usuarios;
```
