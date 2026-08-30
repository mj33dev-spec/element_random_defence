import React from 'react';
import './Home.scss';

const Home = ({ onStartGame, onShowRanking, onShowSettings }) => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="game-title">
          <span className="title-word">POKER</span>
          <span className="title-word">DEFENSE</span>
        </h1>
        
        <div className="menu-buttons">
          <button className="menu-btn start-btn" onClick={onStartGame}>
            <span className="btn-text">게임시작</span>
            <span className="btn-glow"></span>
          </button>
          
          <button className="menu-btn" onClick={onShowRanking}>
            <span className="btn-text">랭킹</span>
          </button>
          
          <button className="menu-btn" onClick={onShowSettings}>
            <span className="btn-text">설정</span>
          </button>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
    </div>
  );
};

export default Home;
