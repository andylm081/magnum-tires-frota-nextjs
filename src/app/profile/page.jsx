'use client';
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user.id;
  const [form, setForm] = useState({ nome: "", telefone: "", cpf: "", cargo: "" });

  useEffect(() => {
    if (status === "authenticated") {
      fetch(`/api/profile?userId=${userId}`)
        .then(r => r.json())
        .then(d => d.profile && setForm(d.profile));
    }
  }, [status, userId]);

  const handle = async (e) => {
    e.preventDefault();
    await fetch("/api/profile/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, ...form }),
    });
    router.push("/");
  };

  if (status !== "authenticated") return <p>Carregando…</p>;

  return (
    <form onSubmit={handle} className="space-y-4 max-w-md mx-auto mt-12">
      {["nome","telefone","cpf","cargo"].map(field => (
        <input
          key={field}
          name={field}
          value={form[field]}
          onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
          required
          className="w-full p-2 border rounded"
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
        />
      ))}
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Salvar Perfil</button>
    </form>
  );
}
