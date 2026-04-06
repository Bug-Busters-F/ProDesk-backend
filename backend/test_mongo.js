require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERRO: Variável MONGO_URI não encontrada no arquivo .env!');
    process.exit(1);
  }

  console.log(`Tentando conectar ao MongoDB na URI: ${uri}`);
  
  try {
    await mongoose.connect(uri);
    console.log('✅ SUCESSO! Conexão com o MongoDB estabelecida com sucesso!');
    await mongoose.disconnect();
    console.log('Conexão encerrada. Tudo funcionando perfeitamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERRO AO CONECTAR NO MONGODB:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
