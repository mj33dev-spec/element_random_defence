import React from 'react';
import './SubPage.scss';

const Settings = ({ onBack }) => {
  return (
    <div className="subpage-container">
      <div className="subpage-content">
        <h2>설정</h2>
        <div className="empty-state">
          <p>설정 메뉴가 준비 중입니다.</p>
        </div>
        <button className="back-btn" onClick={onBack}>돌아가기</button>
      </div>
    </div>
  );
};

export default Settings;
