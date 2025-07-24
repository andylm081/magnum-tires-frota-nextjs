'use client';
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const token = useSearchParams().get("token") || "";
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    fetch(`/api/admin/invite?token=${token}`)
      .then(r => r.json())
      .then(data => setEmail(data.email))
      .catch(() => setFeedback("Convite inválido"));
  }, [token]);

  const handle = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/signup/route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senha }),
    });
    if (!res.ok) {
      const err = await res.json();
      setFeedback(err.error);
    } else {
      router.push("/api/auth/signin");
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4 max-w-md mx-auto mt-12">
      <input type="email" value={email} disabled className="w-full p-2 border rounded" />
      <input type="password" onChange={e => setSenha(e.target.value)} required className="w-full p-2 border rounded" />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Criar Conta</button>
      {feedback && <p className="text-red-600">{feedback}</p>}
    </form>
  );
}
