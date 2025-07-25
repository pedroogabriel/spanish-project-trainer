import React, { useState, useEffect } from 'react';
import { fetchRandomExercise, fetchFilteredExercise } from '../services/auth';
import { supabase } from '../services/supabaseClient';
import stringSimilarity from 'string-similarity';

function Exercise({ userId, userData, onBack, onExerciseComplete, filterType, filterLevel, filterTag }) {
  const [currentExercise, setCurrentExercise] = useState(null);
  const [exerciseAnswer, setExerciseAnswer] = useState('');
  const [exerciseFeedback, setExerciseFeedback] = useState(null);
  const [exerciseScore, setExerciseScore] = useState(null);
  const [attempt, setAttempt] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercise();
  }, []);

  const loadExercise = async () => {
    setLoading(true);
    try {
      let exercise;
      if (filterType || filterLevel || filterTag) {
        exercise = await fetchFilteredExercise({ type: filterType, level: filterLevel, tag: filterTag });
      } else {
        exercise = await fetchRandomExercise();
      }
      setCurrentExercise(exercise);
    } catch (error) {
      console.error('Erro ao carregar exercício:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função de similaridade usando string-similarity
  function similarityScore(a, b) {
    if (!a || !b) return 0;
    return Math.round(stringSimilarity.compareTwoStrings(a, b) * 100);
  }

  function getWrongWords(user, ref) {
    const userWords = user.toLowerCase().split(/\s+/);
    const refWords = ref.toLowerCase().split(/\s+/);
    return refWords.filter(word => !userWords.includes(word));
  }

  function getReviewSuggestion() {
    return 'Reveja: uso de tempos verbais, vocabulário de tecnologia e estrutura de frases complexas.';
  }

  const handleSubmitExercise = async (e) => {
    e.preventDefault();
    if (!currentExercise) return;
    
    const score = similarityScore(exerciseAnswer, currentExercise.referenceAnswer);
    setExerciseScore(score);
    
    let feedback = '';
    if (attempt === 1) {
      feedback = `Você acertou ${score}% da estrutura esperada.`;
    } else if (attempt === 2) {
      const wrongWords = getWrongWords(exerciseAnswer, currentExercise.referenceAnswer);
      feedback = `Você acertou ${score}% da estrutura esperada. Palavras que faltaram: ${wrongWords.join(', ') || 'nenhuma!'}`;
    } else if (attempt === 3) {
      feedback = `Você acertou ${score}% da estrutura esperada. Sugestão: ${getReviewSuggestion()}`;
    }
    setExerciseFeedback(feedback);
    
    if (attempt === 3 && userId) {
      try {
        await supabase.from('user_exercise_results').insert([
          {
            user_id: userId,
            exercise_id: currentExercise.id,
            user_answer: exerciseAnswer,
            score,
            feedback,
          }
        ]);
        
        // Atualizar XP e nível
        const newXp = (userData?.xp ?? 0) + score;
        const newNivel = Math.floor(newXp / 500) + 1;
        
        // Chamar callback para atualizar dados do usuário
        onExerciseComplete(newXp, newNivel);
      } catch (error) {
        console.error('Erro ao salvar resultado:', error);
      }
    }
  };

  const handleTryAgain = () => {
    setAttempt(attempt + 1);
    setExerciseFeedback(null);
    setExerciseScore(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Carregando exercício...</div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Nenhum exercício encontrado</h2>
          <p className="mb-4">Não há exercícios disponíveis para os filtros selecionados.<br/>Tente outros critérios ou fale com o administrador.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={onBack}>Voltar ao Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 p-4 z-0">
      <div className="bg-white rounded shadow-md w-full max-w-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Novo Exercício</h2>
          <button 
            onClick={onBack}
            className="bg-gray-300 text-gray-800 py-2 px-4 rounded hover:bg-gray-400"
          >
            Voltar ao Dashboard
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <p className="text-lg">{currentExercise ? currentExercise.prompt : 'Carregando exercício...'}</p>
          </div>
          
          <textarea
            className="w-full p-3 border rounded-lg resize-none"
            rows={6}
            placeholder="Digite sua resposta em espanhol..."
            value={exerciseAnswer}
            onChange={e => setExerciseAnswer(e.target.value)}
            required
            disabled={attempt > 3}
          />
        </div>

        {exerciseFeedback && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-green-700 font-semibold">{exerciseFeedback}</div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {attempt < 3 && (
            <button 
              type="button" 
              className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold"
              onClick={handleTryAgain}
            >
              Tentar novamente
            </button>
          )}
          <button 
            type="submit" 
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-semibold"
            onClick={handleSubmitExercise}
            disabled={attempt > 3 || (!!exerciseFeedback && attempt === 3)}
          >
            Enviar
          </button>
        </div>

        {attempt > 3 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 font-bold text-center">
              Limite de tentativas atingido. Volte ao dashboard para tentar outro exercício.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Exercise; 