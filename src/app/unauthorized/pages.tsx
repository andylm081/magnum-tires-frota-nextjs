// src/app/unauthorized/page.tsx
"use client";

import { useRouter } from "next/navigation";

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Acesso Negado</h1>
      <p>Você não tem permissão para acessar esta página.</p>
      <p>
        Se você acha que isso é um erro, entre em contato com o administrador.
      </p>
      {/* Botão para redirecionar para a página de login */}
      <button onClick={() => router.push("/auth/signin")}>
        Ir para Login
      </button>
    </div>
  );
};

export default UnauthorizedPage;
