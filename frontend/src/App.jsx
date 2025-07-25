import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser, fetchUserData, fetchUserExerciseHistory, updateUserXpAndLevel, fetchFilteredExercise } from './services/auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Exercise from './components/Exercise';
import ExerciseAdmin from './components/ExerciseAdmin';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');
  const [showFilter, setShowFilter] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const checkAuth = async () => {
    try {
      const { data } = await getCurrentUser();
      if (data && data.user) {
        setLoggedIn(true);
        setUserId(data.user.id);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [userDataResult, historyResult] = await Promise.all([
        fetchUserData(userId),
        fetchUserExerciseHistory(userId)
      ]);
      setUserData(userDataResult);
      setHistory(historyResult);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUserData(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setLoggedIn(true);
    checkAuth();
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserId(null);
    setUserData(null);
    setHistory([]);
    setCurrentView('dashboard');
  };

  const handleStartExercise = () => {
    setCurrentView('exercise');
  };

  const handleApplyFilter = async () => {
    setShowFilter(false);
    setCurrentView('exercise');
  };

  const handleExerciseComplete = async (newXp, newNivel) => {
    try {
      await updateUserXpAndLevel(userId, newXp, newNivel);
      await loadUserData();
      setCurrentView('dashboard');
    } catch (error) {
      console.error('Erro ao atualizar dados após exercício:', error);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleGoToAdmin = () => {
    setCurrentView('admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl">Carregando...</div>
      </div>
    );
  }

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        {currentView === 'dashboard' && (
          <Dashboard
            userData={userData}
            history={history}
            onLogout={handleLogout}
            onStartExercise={handleStartExercise}
            onGoToAdmin={handleGoToAdmin}
          />
        )}
        
        {currentView === 'exercise' && (
          <Exercise
            userId={userId}
            userData={userData}
            onBack={handleBackToDashboard}
            onExerciseComplete={handleExerciseComplete}
            filterType={filterType}
            filterLevel={filterLevel}
            filterTag={filterTag}
          />
        )}
        {currentView === 'admin' && (
          <ExerciseAdmin onBack={handleBackToDashboard} />
        )}
      </div>
    </Router>
  );
}

export default App;
