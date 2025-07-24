// src/app/admin/page.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

const AdminPage = () => {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div>
        <h1>Página de Administração</h1>
        <p>Bem-vindo, você tem permissão de administrador.</p>
        {/* O conteúdo da página de admin vai aqui */}
      </div>
    </ProtectedRoute>
  );
};

export default AdminPage;
