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

    // Verificar se as tabelas existem
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Tabelas encontradas no banco:', tables.map(t => Object.values(t)[0]));

    // Contar registros em cada tabela
    const tabelas = ['usuarios', 'categorias', 'produtos', 'pedidos', 'itens_pedido', 'avaliacoes_produtos'];
    
    console.log('\n📊 Contagem de registros por tabela:');
    for (const tabela of tabelas) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as total FROM ${tabela}`);
        console.log(`   - ${tabela}: ${rows[0].total} registro(s)`);
      } catch (err) {
        console.log(`   - ${tabela}: ⚠️ Tabela ainda não criada ou erro (${err.message})`);
      }
    }

    await connection.end();
    console.log('\n✅ Teste concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('💡 Dica: Certifique-se de que o MySQL (ex: XAMPP, Wamp ou serviço local) está iniciado.');
    console.error('💡 E execute o script SQL em database.sql para criar todas as 6 tabelas!');
  }
}

testarConexao();
