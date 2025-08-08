import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'aslima@magnumtires.com.br';
  const senha = '123456'; // Use uma senha segura no ambiente real

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Usuário já existe');
    return;
  }

  const passwordHash = await hash(senha, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      role: Role.ADMIN, // ou Role.USER, Role.MODERATOR
      Profile: {
        create: {
          nomeCompleto: 'Anderson Lima',
          telefone: '11999999999',
          cpf: '12345678900',
          cargo: 'Administrador',
        }
      }
    },
  });

  console.log('Usuário criado com sucesso:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
