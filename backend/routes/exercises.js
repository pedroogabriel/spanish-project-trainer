const express = require('express');
const router = express.Router();

// Mock de exercícios
const exercises = [
  {
    id: 'ex001',
    type: 'translation',
    level: 'advanced',
    prompt: "Traduza para espanhol: 'O impacto das redes sociais no comportamento humano é crescente.'",
    referenceAnswer: 'El impacto de las redes sociales en el comportamiento humano está en aumento.',
    tags: ['sociedade', 'comportamento', 'tecnologia']
  }
];

router.get('/', (req, res) => {
  res.json(exercises);
});

module.exports = router;
