import React from 'react';
import './SubPage.scss';

const Ranking = ({ onBack }) => {
  return (
    <div className="subpage-container">
      <div className="subpage-content">
        <h2>랭킹</h2>
        <div className="empty-state">
          <p>랭킹 시스템이 준비 중입니다.</p>
        </div>
        <button className="back-btn" onClick={onBack}>돌아가기</button>
      </div>
    </div>
  );
};

export default Ranking;
