"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Componente de Proteção de Rota
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole: string }) => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      if (session.user.role !== requiredRole) {
        // Redireciona para a página de Unauthorized se o usuário não tiver a role necessária
        router.push("/unauthorized");
      }
    } else if (status === "unauthenticated") {
      // Caso o usuário não esteja autenticado, redireciona para a página de login
      router.push("/auth/signin");
    }
  }, [status, session, requiredRole, router]);

  if (status === "loading") {
    return <div>Carregando...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
