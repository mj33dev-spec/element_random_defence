import React, { useState } from 'react';
import './QuestDrawer.scss';
import questsData from '../../data/quests.json';

const QuestDrawer = ({ completedQuests, onGoHome }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="quest-drawer-container">
            <button 
                className={`quest-toggle-btn ${isOpen ? 'open' : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '>>' : '<<'}
            </button>
            <div className={`quest-drawer-panel ${isOpen ? 'open' : ''}`}>
                <div className="panel-header">
                    <h2>메뉴</h2>
                    <button className="exit-btn" onClick={onGoHome}>나가기 🚪</button>
                </div>
                <h3>도전 과제 {completedQuests.size > 0 ? `(${completedQuests.size}/${questsData.length})` : ''}</h3>
                <div className="quest-list">
                    {questsData.map((quest: any) => {
                        const isCompleted = completedQuests.has(quest.id);
                        return (
                            <div key={quest.id} className={`quest-item ${isCompleted ? 'completed' : ''}`}>
                                <div className="quest-header">
                                    <h3 className="quest-title">
                                        {isCompleted ? '✅ ' : ''}{quest.title}
                                    </h3>
                                    <span className="quest-reward">💰 {quest.rewardGold} G</span>
                                </div>
                                <p className="quest-desc">{quest.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default QuestDrawer;
