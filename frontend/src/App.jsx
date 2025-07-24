import React, { useState } from 'react';
import { login, signup } from './services/auth';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');

  // Login ou cadastro real
  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await signup(email, password);
        setIsSignup(false);
        setError('Cadastro realizado! Faça login.');
      } else {
        await login(email, password);
        setLoggedIn(true);
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar.');
    }
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleAuth} className="bg-white p-8 rounded shadow-md w-80">
          <h2 className="text-2xl font-bold mb-4">{isSignup ? 'Cadastro' : 'Login'} Hispano Trainer</h2>
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} className="mb-2 w-full p-2 border rounded" required />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} className="mb-4 w-full p-2 border rounded" required />
          {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mb-2">{isSignup ? 'Cadastrar' : 'Entrar'}</button>
          <button type="button" className="w-full text-blue-600 underline" onClick={() => { setIsSignup(!isSignup); setError(''); }}>
            {isSignup ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
          </button>
        </form>
      </div>
    );
  }

  // Dashboard mock
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white rounded shadow p-6">
        <h1 className="text-3xl font-bold mb-2">Bem-vindo ao Hispano Trainer!</h1>
        <p className="mb-4">Seu progresso:</p>
        <div className="flex items-center mb-4">
          <span className="text-xl font-semibold mr-2">XP:</span>
          <span className="text-2xl text-green-600 font-bold">500</span>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Novo Exercício</button>
      </div>
    </div>
  );
}

export default App;
