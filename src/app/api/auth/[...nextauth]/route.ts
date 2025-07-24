// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma'; // Usar o cliente Prisma singleton
import { compare } from 'bcryptjs';
import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
  // O PrismaAdapter não é necessário quando se usa apenas o provider de credenciais.
  // A lógica de 'authorize' já faz a ligação com o banco de dados.
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Por favor, forneça o e-mail e a senha.');
        }

        // 1. Encontrar o utilizador no banco de dados pelo e-mail
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Utilizador não encontrado ou senha não configurada.');
        }

        // 2. Comparar a senha fornecida com o hash armazenado
        const isPasswordCorrect = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          throw new Error('Senha incorreta.');
        }

        // 3. Se tudo estiver correto, retornar os dados do utilizador para a sessão
        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    // Adiciona o ID e a role ao token JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // O 'as any' é para contornar um problema de tipo do NextAuth
      }
      return token;
    },
    // Adiciona o ID e a role à sessão do cliente para que possamos usá-los na UI
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Aponta para a sua página de login personalizada
  },
  secret: process.env.NEXTAUTH_SECRET, // Variável de ambiente para segurança
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };