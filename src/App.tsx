import { useState } from 'react';
import GameBoard from './components/game/GameBoard.jsx';
import Home from './pages/Home.jsx';
import Ranking from './pages/Ranking.jsx';
import Settings from './pages/Settings.jsx';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'game', 'ranking', 'settings'

  const startGame = () => setCurrentView('game');
  const showRanking = () => setCurrentView('ranking');
  const showSettings = () => setCurrentView('settings');
  const goHome = () => setCurrentView('home');

  return (
    <>
      {currentView === 'home' && (
        <Home 
          onStartGame={startGame} 
          onShowRanking={showRanking} 
          onShowSettings={showSettings} 
        />
      )}
      {currentView === 'game' && <GameBoard key="v20" onGoHome={goHome} />}
      {currentView === 'ranking' && <Ranking onBack={goHome} />}
      {currentView === 'settings' && <Settings onBack={goHome} />}
    </>
  );
}

export default App;
