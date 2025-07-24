const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.send('Hispano Trainer API rodando!');
});

// Importar rotas de exercícios
const exercisesRouter = require('./routes/exercises');
app.use('/api/exercises', exercisesRouter);

// Importar rotas de autenticação
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});