import React, { useState } from 'react';
import { logout } from '../services/auth';
import { updatePassword } from '../services/auth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// Lista de conquistas e critérios
const BADGES = [
  {
    id: 'first-translation',
    nome: 'Primeira Tradução Longa',
    descricao: 'Realize seu primeiro exercício de tradução de parágrafo.',
    criterio: (history) => history.length > 0,
  },
  {
    id: 'ten-high-scores',
    nome: '10 Exercícios Acima de 90%',
    descricao: 'Acerte 10 exercícios com score ≥ 90%.',
    criterio: (history) => history.filter(h => h.score >= 90).length >= 10,
  },
  {
    id: '1000-xp',
    nome: '1000 XP Acumulados',
    descricao: 'Alcance 1000 XP.',
    criterio: (history, userData) => (userData?.xp ?? 0) >= 1000,
  },
  {
    id: 'productive-week',
    nome: 'Semana Produtiva',
    descricao: 'Realize pelo menos 5 exercícios em uma semana.',
    criterio: (history) => {
      const now = new Date();
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      return history.filter(h => new Date(h.created_at) >= weekAgo).length >= 5;
    },
  },
  {
    id: 'first-perfect',
    nome: 'Primeira Resposta Perfeita',
    descricao: 'Acerte 100% em um exercício.',
    criterio: (history) => history.some(h => h.score === 100),
  },
];

function getWeeklyProgress(history) {
  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  return history.filter(h => new Date(h.created_at) >= weekAgo).length;
}

// Análise de erros comuns e dicas
function getCommonMistakes(history) {
  const wordCount = {};
  history.forEach(item => {
    if (item.feedback && item.feedback.includes('Palavras que faltaram:')) {
      const match = item.feedback.match(/Palavras que faltaram: (.*)/);
      if (match && match[1]) {
        match[1].split(',').map(w => w.trim()).forEach(word => {
          if (word && word !== 'nenhuma!') {
            wordCount[word] = (wordCount[word] || 0) + 1;
          }
        });
      }
    }
  });
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));
}

function getWeakestType(history) {
  const typeCount = {};
  history.forEach(item => {
    if (item.type && item.score < 70) {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    }
  });
  const sorted = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : null;
}

function Dashboard({ userData, history, onLogout, onStartExercise, onGoToAdmin }) {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const [showChangePwd, setShowChangePwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setPwdMsg('');
    setPwdLoading(true);
    try {
      await updatePassword(newPwd);
      setPwdMsg('Senha alterada com sucesso!');
      setNewPwd('');
    } catch (err) {
      setPwdMsg('Erro ao alterar senha.');
    } finally {
      setPwdLoading(false);
    }
  };

  // Calcular badges desbloqueados
  const unlockedBadges = BADGES.filter(badge => badge.criterio(history, userData));
  const lockedBadges = BADGES.filter(badge => !badge.criterio(history, userData));

  const weeklyProgress = getWeeklyProgress(history);
  const weeklyGoal = 5;
  const progressPercent = Math.min(100, Math.round((weeklyProgress / weeklyGoal) * 100));

  // Gerar dados para gráfico de XP ao longo do tempo
  const xpHistory = history
    .map((item, idx) => ({
      name: new Date(item.created_at).toLocaleDateString('pt-BR'),
      xp: history.slice(0, idx + 1).reduce((sum, h) => sum + h.score, 0),
    }))
    .reverse();

  // Gerar dados para gráfico de acertos (%) por exercício
  const scoreHistory = history
    .map((item, idx) => ({
      name: idx + 1,
      score: item.score,
    }))
    .reverse();

  const commonMistakes = getCommonMistakes(history);
  const weakestType = getWeakestType(history);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-4 md:p-8 z-0">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-blue-100">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Bem-vindo ao Hispano Trainer!</h1>
            <button 
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Progress Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Seu Progresso</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">XP:</span>
                <span className="text-3xl text-green-600 font-bold">{userData?.xp ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Nível:</span>
                <span className="text-3xl text-blue-600 font-bold">{userData?.nivel ?? 1}</span>
              </div>
            </div>
            {/* Barra de progresso semanal */}
            <div className="mt-6">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Progresso semanal</span>
                <span className="text-sm text-gray-600">{weeklyProgress}/{weeklyGoal} exercícios</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${progressPercent >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progressPercent}%`, transition: 'width 0.5s' }}
                ></div>
              </div>
              {progressPercent >= 100 && (
                <div className="mt-2 text-green-700 font-semibold text-sm">Meta semanal atingida! 🎉</div>
              )}
            </div>
            {/* Gráfico de evolução de XP */}
            <div className="mt-8">
              <h3 className="text-md font-bold mb-2">Evolução de XP</h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={xpHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="xp" stroke="#2563eb" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <button 
              onClick={onStartExercise}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 font-semibold"
            >
              Novo Exercício
            </button>
            <button
              onClick={onGoToAdmin}
              className="w-full mt-2 bg-gray-700 text-white py-2 px-4 rounded hover:bg-gray-800 font-semibold"
            >
              Painel de Administração
            </button>
            <button
              onClick={() => setShowChangePwd(true)}
              className="w-full mt-2 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 font-semibold"
            >
              Alterar senha
            </button>
            {/* Badges */}
            <div className="mt-10">
              <h3 className="text-lg font-bold mb-2">Conquistas</h3>
              <div className="flex flex-wrap gap-4">
                {unlockedBadges.map(badge => (
                  <div key={badge.id} className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-xl shadow text-sm font-semibold flex flex-col items-center min-w-[120px]">
                    <span className="text-2xl mb-1">🏅</span>
                    <span className="text-center">{badge.nome}</span>
                  </div>
                ))}
                {lockedBadges.map(badge => (
                  <div key={badge.id} className="bg-gray-100 border border-gray-300 text-gray-400 px-4 py-3 rounded-xl shadow text-sm flex flex-col items-center min-w-[120px]">
                    <span className="text-2xl mb-1">🔒</span>
                    <span className="text-center">{badge.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Exercícios realizados:</span>
                <span className="font-semibold">{history.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Média de acerto:</span>
                <span className="font-semibold">
                  {history.length > 0 
                    ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length)
                    : 0}%
                </span>
              </div>
            </div>
            {/* Gráfico de acertos por exercício */}
            <div className="mt-8">
              <h3 className="text-md font-bold mb-2">Acertos por exercício</h3>
              <div className="w-full h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow p-8 border border-gray-100">
          <h2 className="text-xl font-bold mb-4">Histórico de Exercícios</h2>
          {/* Feed de erros comuns e dicas */}
          <div className="mb-8">
            <h3 className="text-md font-bold mb-2 text-red-700">Erros mais frequentes</h3>
            {commonMistakes.length === 0 ? (
              <div className="text-gray-500 text-sm mb-2">Nenhum erro recorrente detectado.</div>
            ) : (
              <ul className="mb-2 text-sm">
                {commonMistakes.map(mistake => (
                  <li key={mistake.word} className="text-red-600">{mistake.word} <span className="text-gray-500">({mistake.count}x)</span></li>
                ))}
              </ul>
            )}
            <h3 className="text-md font-bold mb-2 text-blue-700">Dica personalizada</h3>
            {weakestType ? (
              <div className="text-blue-700 text-sm">Pratique mais exercícios do tipo <b>{weakestType}</b> para melhorar seu desempenho.</div>
            ) : (
              <div className="text-gray-500 text-sm">Continue praticando para receber dicas personalizadas!</div>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Nenhum exercício realizado ainda.
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item) => (
                <div key={item.id} className="border rounded-xl p-4 hover:bg-gray-50 transition-all">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <span className="font-medium text-lg">{item.exercise_id}</span>
                    <span className={`font-bold text-lg ${
                      item.score >= 90 ? 'text-green-600' : 
                      item.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {item.score}%
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {new Date(item.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-800">{item.feedback}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showChangePwd && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80 relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => { setShowChangePwd(false); setPwdMsg(''); setNewPwd(''); }}>&times;</button>
            <h3 className="text-lg font-bold mb-2">Alterar senha</h3>
            <form onSubmit={handleChangePwd}>
              <input type="password" className="w-full p-2 border rounded mb-2" placeholder="Nova senha" value={newPwd} onChange={e => setNewPwd(e.target.value)} required />
              <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded mb-2" disabled={pwdLoading}>{pwdLoading ? 'Alterando...' : 'Alterar senha'}</button>
            </form>
            {pwdMsg && <div className="text-sm text-gray-700 mt-2">{pwdMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 