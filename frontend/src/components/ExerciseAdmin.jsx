import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

function ExerciseAdmin({ onBack }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ id: '', prompt: '', referenceAnswer: '', type: '', level: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('exercises').select('*').order('id');
    if (error) setError(error.message);
    else setExercises(data);
    setLoading(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.prompt || !form.referenceAnswer) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (editingId) {
      // Editar exercício
      const { error } = await supabase.from('exercises').update(form).eq('id', editingId);
      if (error) setError(error.message);
      else {
        setEditingId(null);
        setForm({ id: '', prompt: '', referenceAnswer: '', type: '', level: '' });
        fetchExercises();
      }
    } else {
      // Criar novo exercício
      const { error } = await supabase.from('exercises').insert([{ ...form }]);
      if (error) setError(error.message);
      else {
        setForm({ id: '', prompt: '', referenceAnswer: '', type: '', level: '' });
        fetchExercises();
      }
    }
  };

  const handleEdit = (exercise) => {
    setEditingId(exercise.id);
    setForm({ ...exercise });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este exercício?')) return;
    const { error } = await supabase.from('exercises').delete().eq('id', id);
    if (error) setError(error.message);
    else fetchExercises();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-4 md:p-8 z-0">
      <div className="max-w-3xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Administração de Exercícios</h2>
          <button onClick={onBack} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">Voltar</button>
        </div>
        <form onSubmit={handleSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="id" value={form.id} onChange={handleChange} placeholder="ID" className="p-2 border rounded" required />
          <input name="type" value={form.type} onChange={handleChange} placeholder="Tipo (ex: translation)" className="p-2 border rounded" />
          <input name="level" value={form.level} onChange={handleChange} placeholder="Nível (ex: advanced)" className="p-2 border rounded" />
          <input name="prompt" value={form.prompt} onChange={handleChange} placeholder="Prompt" className="p-2 border rounded col-span-1 md:col-span-2" required />
          <input name="referenceAnswer" value={form.referenceAnswer} onChange={handleChange} placeholder="Resposta de referência" className="p-2 border rounded col-span-1 md:col-span-2" required />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded col-span-1 md:col-span-2">{editingId ? 'Salvar Alterações' : 'Adicionar Exercício'}</button>
        </form>
        {error && <div className="mb-4 text-red-600">{error}</div>}
        {loading ? (
          <div>Carregando exercícios...</div>
        ) : (
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">Nível</th>
                <th className="p-2 border">Prompt</th>
                <th className="p-2 border">Resposta</th>
                <th className="p-2 border">Ações</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map(ex => (
                <tr key={ex.id} className="border-b">
                  <td className="p-2 border">{ex.id}</td>
                  <td className="p-2 border">{ex.type}</td>
                  <td className="p-2 border">{ex.level}</td>
                  <td className="p-2 border max-w-xs truncate" title={ex.prompt}>{ex.prompt}</td>
                  <td className="p-2 border max-w-xs truncate" title={ex.referenceAnswer}>{ex.referenceAnswer}</td>
                  <td className="p-2 border">
                    <button onClick={() => handleEdit(ex)} className="text-blue-600 hover:underline mr-2">Editar</button>
                    <button onClick={() => handleDelete(ex.id)} className="text-red-600 hover:underline">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ExerciseAdmin; 