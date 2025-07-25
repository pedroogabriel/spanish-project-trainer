import React, { useState } from 'react';
import { login, signup } from '../services/auth';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
        setIsSignup(false);
        setError('Cadastro realizado! Faça login.');
      } else {
        await login(email, password);
        onLogin();
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleAuth} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-4">{isSignup ? 'Cadastro' : 'Login'} Hispano Trainer</h2>
        <input 
          type="email" 
          placeholder="E-mail" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          className="mb-2 w-full p-2 border rounded" 
          required 
        />
        <input 
          type="password" 
          placeholder="Senha" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          className="mb-4 w-full p-2 border rounded" 
          required 
        />
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-2 rounded mb-2"
          disabled={loading}
        >
          {loading ? 'Carregando...' : (isSignup ? 'Cadastrar' : 'Entrar')}
        </button>
        <button 
          type="button" 
          className="w-full text-blue-600 underline" 
          onClick={() => { setIsSignup(!isSignup); setError(''); }}
        >
          {isSignup ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
        </button>
        <button type="button" className="w-full bg-gray-200 text-gray-700 py-2 rounded mt-2" disabled>
          Entrar com Google (em breve)
        </button>
      </form>
    </div>
  );
}

export default Login; 