import React from 'react';
import { logout } from '../services/auth';

function Dashboard({ userData, history, onLogout, onStartExercise }) {
  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded shadow p-6 mb-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-bold mb-4">Seu Progresso</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">XP:</span>
                <span className="text-3xl text-green-600 font-bold">{userData?.xp ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Nível:</span>
                <span className="text-3xl text-blue-600 font-bold">{userData?.nivel ?? 1}</span>
              </div>
            </div>
            <button 
              onClick={onStartExercise}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded hover:bg-blue-700 font-semibold"
            >
              Novo Exercício
            </button>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded shadow p-6">
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
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-xl font-bold mb-4">Histórico de Exercícios</h2>
          {history.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              Nenhum exercício realizado ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border rounded p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
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
    </div>
  );
}

export default Dashboard; 