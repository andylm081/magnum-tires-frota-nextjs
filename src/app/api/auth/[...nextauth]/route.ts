// src/app/api/auth/[...nextauth]/route.ts

export const runtime = 'nodejs';

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { AuthOptions } from 'next-auth';

export const authOptions: AuthOptions = {
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error('Utilizador não encontrado ou senha não configurada.');
        }

        const isPasswordCorrect = await compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordCorrect) {
          throw new Error('Senha incorreta.');
        }

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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // A conversão 'as any' ajuda o TypeScript a aceitar a propriedade 'role'
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Adicionamos as propriedades do token à sessão
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
