const bcrypt = require('bcryptjs');

// Senha do usuário
const password = 'Andymag2024!';

// Gerar o hash da senha
bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Senha criptografada:', hash);
});
