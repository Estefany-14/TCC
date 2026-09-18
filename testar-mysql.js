const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'conecta_plus'
};

async function testarConexao() {
  try {
    console.log('🔍 Tentando conectar ao MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conectado ao MySQL com sucesso!');

    // Verificar se a tabela usuarios existe
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📋 Tabelas no banco:', tables);

    // Verificar quantos usuários existem
    const [rows] = await connection.query('SELECT * FROM usuarios');
    console.log('👥 Usuários cadastrados:', rows.length);
    console.log('📝 Dados:', rows);

    await connection.end();
    console.log('✅ Teste concluído!');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('💡 Dica: Verifique se o banco de dados "conecta_plus" existe no MySQL');
    console.error('💡 Execute o script SQL em database.sql para criar o banco e a tabela');
  }
}

testarConexao();
