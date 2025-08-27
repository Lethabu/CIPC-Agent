import React, { useState } from 'react';
import { z } from 'zod';

const schema = z.object({
  regNo: z.string().min(1),
  name: z.string().min(2),
  id: z.string().min(6),
  pct: z.number().min(0).max(100),
});

export default function BOForm() {
  const [form, setForm] = useState({ regNo: '', name: '', id: '', pct: 0 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, pct: Number(form.pct) });
    if (!parsed.success) return alert('Invalid input');
    setLoading(true);
    const res = await fetch('/api/bo/assist', { method: 'POST', body: JSON.stringify(parsed.data), headers: { 'Content-Type': 'application/json' } });
    setResult(await res.json());
    setLoading(false);
  };

  return (
    <form onSubmit={submit}>
      <input value={form.regNo} onChange={e => setForm({ ...form, regNo: e.target.value })} placeholder="Reg No" />
      <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" />
      <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="ID" />
      <input type="number" value={form.pct} onChange={e => setForm({ ...form, pct: Number(e.target.value) })} placeholder="%" />
      <button disabled={loading}>Submit</button>
      {result && <pre>{JSON.stringify(result)}</pre>}
    </form>
  );
}
