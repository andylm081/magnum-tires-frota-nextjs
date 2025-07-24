import NextAuth from "next-auth";
import { DefaultSession } from "next-auth";

// Defina o tipo da sessão para incluir a propriedade `role`
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string; // Adicionando a propriedade `role` ao tipo do usuário
    } & DefaultSession["user"];
  }

  // Se você estiver usando o JWT para armazenar a sessão, também pode estender o tipo do token:
  interface JWT {
    role: string; // Adicionando `role` ao tipo do JWT
  }
}
