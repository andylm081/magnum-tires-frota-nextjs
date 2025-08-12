// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
// import { YourProvidersAqui } from "./seus-providers"; // mantenha seus providers atuais

export const authOptions: NextAuthOptions = {
  // ⚠️ MANTENHA seus providers atuais aqui:
  providers: [
    // ... seus providers (Credentials/Google/etc.)
  ],

  session: {
    strategy: "jwt",
  },

  // Log útil enquanto depura o CLIENT_FETCH_ERROR (desative em prod se quiser)
  debug: process.env.NODE_ENV !== "production",

  callbacks: {
    // Garante que o token sempre tenha id/role quando houver user (ex.: no login)
    async jwt({ token, user }) {
      if (user) {
        // `user` vem do provider: adapte conforme seu retorno
        // (ex.: user.id / user.role do seu banco)
        token.id = (user as any).id ?? token.id;
        token.role = (user as any).role ?? (token.role as string) ?? "user";
      }
      // Sempre retorne um objeto
      return token;
    },

    // Injeta id/role no session.user – respeitando seu d.ts
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? session.user.id ?? "";
        session.user.role = (token.role as string) ?? session.user.role ?? "user";
      }
      // Sempre retorne um objeto
      return session;
    },

    // (Opcional) bloqueia signIn retornando boolean – mas sempre retorne algo
    async signIn() {
      return true;
    },
  },
};
