// /api/admin/invite-role.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) return res.status(400).json({ error: 'Token não fornecido' });

  const { data, error } = await supabase
    .from('convites')
    .select('role')
    .eq('token', token)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Convite não encontrado ou expirado' });
  }

  return res.status(200).json({ role: data.role });
}
