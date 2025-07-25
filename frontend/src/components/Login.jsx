import React, { useState } from 'react';
import { login, signup, resetPassword } from '../services/auth';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

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

  const handleReset = async (e) => {
    e.preventDefault();
    setResetMsg('');
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetMsg('Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.');
    } catch (err) {
      setResetMsg('Erro ao solicitar redefinição.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 z-0">
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
        <button type="button" className="w-full text-gray-500 underline mt-2" onClick={() => setShowReset(true)}>
          Esqueci minha senha
        </button>
      </form>
      {showReset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowReset(false)}>&times;</button>
            <h3 className="text-lg font-bold mb-2">Redefinir senha</h3>
            <form onSubmit={handleReset}>
              <input type="email" className="w-full p-2 border rounded mb-2" placeholder="Seu e-mail" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded mb-2" disabled={resetLoading}>{resetLoading ? 'Enviando...' : 'Enviar link de redefinição'}</button>
            </form>
            {resetMsg && <div className="text-sm text-gray-700 mt-2">{resetMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login; 