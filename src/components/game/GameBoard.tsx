import React from 'react';
import { useGameLoop } from '../../hooks/useGameLoop.js';
import { BOARD_WIDTH, BOARD_HEIGHT, isPath, isBuildable } from '../../constants/gameMap.js';
import toDownImg from '../../assets/enemy/monster1/todown.png';
import toLeftImg from '../../assets/enemy/monster1/toleft.png';
import toUpImg from '../../assets/enemy/monster1/toup.png';
import charactorImg from '../../assets/my/charactor.png';
import weaponImg from '../../assets/my/weapon.png';
import QuestDrawer from './QuestDrawer.tsx';
import './game.scss';

export default function GameBoard({ onGoHome }) {
    const { gameState, completedQuests, toastMessage, buildTower, mergeTowers, moveTower } = useGameLoop();
    const [selectedTowerId, setSelectedTowerId] = React.useState(null);
    const [dragOverTile, setDragOverTile] = React.useState(null);
    const [activeToasts, setActiveToasts] = React.useState([]);
    const [boardSize, setBoardSize] = React.useState(600);

    React.useEffect(() => {
        const handleResize = () => {
            // 패딩 40px 제외한 가로, 상단 UI 및 여백 150px 제외한 세로, 그리고 최대 600px 중 가장 작은 값
            const maxWidth = window.innerWidth - 40;
            const maxHeight = window.innerHeight - 150;
            const size = Math.max(200, Math.min(maxWidth, maxHeight, 600)); // 최소 200px 보장
            setBoardSize(size);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    React.useEffect(() => {
        if (toastMessage) {
            setActiveToasts(prev => [...prev, toastMessage]);
            setTimeout(() => {
                setActiveToasts(prev => prev.filter(t => t.id !== toastMessage.id));
            }, 3500); // Hide after 3.5 seconds
        }
    }, [toastMessage]);

    const handleTileClick = (x, y) => {
        if (!isBuildable(x, y)) {
            setSelectedTowerId(null);
            return;
        }

        const tileTowers = gameState.towers.filter(t => t.x === x && t.y === y);
        if (tileTowers.length > 0) {
            setSelectedTowerId(null);
            return;
        }

        // Build new tower
        if (buildTower(x, y)) {
            setSelectedTowerId(null);
            console.log(`Built tower at ${x}, ${y}`);
        }
    };

    return (
        <div className="game-container">
            <div className="ui-overlay">
                <div className="ui-stat">Gold: {gameState.gold} 💰</div>
                <div className="ui-stat">Lives: {gameState.lives} ❤️</div>
                <div className="ui-stat">Round: {gameState.round} ⚔️</div>
            </div>

            <QuestDrawer completedQuests={completedQuests} onGoHome={onGoHome} />

            {/* Toast Notifications Container */}
            <div className="toast-container">
                {activeToasts.map(toast => (
                    <div key={toast.timestamp} className="toast-message">
                        🎉 <strong>{toast.title}</strong> 달성! 
                        <span className="toast-reward"> +{toast.rewardGold} 골드</span>
                    </div>
                ))}
            </div>

            {gameState.isGameOver && (
                <div className="game-over">GAME OVER</div>
            )}

            <div 
                className="board" 
                style={{
                    width: `${boardSize}px`,
                    height: `${boardSize}px`,
                    gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
                    gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`
                }}
            >
                {Array.from({ length: BOARD_WIDTH * BOARD_HEIGHT }).map((_, index) => {
                    const x = index % BOARD_WIDTH;
                    const y = Math.floor(index / BOARD_WIDTH);
                    const path = isPath(x, y);
                    const buildable = isBuildable(x, y);
                    const tower = gameState.towers.find(t => t.x === x && t.y === y);

                    let tileClass = 'tile empty';
                    if (path) tileClass = 'tile path';
                    else if (buildable) tileClass = 'tile buildable';
                    
                    if (dragOverTile && dragOverTile.x === x && dragOverTile.y === y) {
                        tileClass += ' drag-over';
                    }

                    return (
                        <div 
                            key={`${x}-${y}`} 
                            className={tileClass}
                            onClick={() => handleTileClick(x, y)}
                            onDragEnter={(e) => {
                                e.preventDefault();
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                // 시각적으로 드롭 가능 여부 표시 및 지속적인 호버 가이드 갱신
                                if (!buildable || tower) {
                                    e.dataTransfer.dropEffect = 'none';
                                } else {
                                    e.dataTransfer.dropEffect = 'move';
                                    // 타일이 달라졌을 때만 상태 업데이트 (무한 렌더링 방지)
                                    if (!dragOverTile || dragOverTile.x !== x || dragOverTile.y !== y) {
                                        setDragOverTile({ x, y });
                                    }
                                }
                            }}
                            onDragLeave={(e) => {
                                if (dragOverTile && dragOverTile.x === x && dragOverTile.y === y) {
                                    setDragOverTile(null);
                                }
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOverTile(null);
                                
                                // 드롭 시점에 조건 재검증
                                if (!buildable || tower) return;

                                const sourceIdStr = e.dataTransfer.getData('text/plain');
                                if (sourceIdStr) {
                                    const sourceId = parseInt(sourceIdStr);
                                    moveTower(sourceId, x, y);
                                }
                            }}
                        />
                    );
                })}

                {/* Render Towers as absolute overlays on the board */}
                {gameState.towers.map(tower => (
                    <div 
                        key={`tower-${tower.id}`}
                        className="tower-overlay"
                        style={{
                            transform: `translate(${tower.x * 100}%, ${tower.y * 100}%)`,
                            cursor: 'pointer'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Select this tower to show info panel, or unselect if already selected
                            setSelectedTowerId(selectedTowerId === tower.id ? null : tower.id);
                        }}
                        draggable={true}
                        onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', tower.id.toString());
                        }}
                        onDragEnter={(e) => {
                            e.preventDefault();
                        }}
                        onDragOver={(e) => {
                            e.preventDefault(); // Allow drop
                            if (!dragOverTile || dragOverTile.x !== tower.x || dragOverTile.y !== tower.y) {
                                setDragOverTile({ x: tower.x, y: tower.y });
                            }
                        }}
                        onDragLeave={(e) => {
                            if (dragOverTile && dragOverTile.x === tower.x && dragOverTile.y === tower.y) {
                                setDragOverTile(null);
                            }
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            setDragOverTile(null);
                            
                            const sourceIdStr = e.dataTransfer.getData('text/plain');
                            if (sourceIdStr) {
                                const sourceId = parseInt(sourceIdStr);
                                mergeTowers(sourceId, tower.id);
                            }
                        }}
                    >
                        <div className="hit-range" style={{ opacity: selectedTowerId === tower.id ? 1 : 0 }} />
                        <div className={`tower-sprite-wrapper tower-${tower.type.toLowerCase()}`} style={{
                            transform: tower.direction === 'left' ? 'scaleX(-1)' : 'none'
                        }}>
                            <img 
                                src={charactorImg} 
                                className="tower-sprite"
                                alt="tower"
                                draggable={false}
                                style={{ 
                                    '--frames': 6,
                                    '--types': 5,
                                    '--visual-type': tower.visualType 
                                } as React.CSSProperties}
                            />
                        </div>
                        {tower.weapons && tower.weapons.map((weapon, wIndex) => (
                            <div 
                                key={wIndex}
                                className="weapon-orbit-container"
                                style={{ transform: `rotate(${weapon.angle}deg)` }}
                            >
                                <div 
                                    className="weapon-sprite" 
                                    style={{
                                        backgroundImage: `url(${weaponImg})`,
                                        '--visual-type': tower.visualType,
                                        '--weapon-type': tower.weaponType === '검' ? 0 : tower.weaponType === '표창' ? 1 : 2
                                    } as React.CSSProperties}
                                />
                            </div>
                        ))}
                    </div>
                ))}

                {/* Render Tower Levels on top of ALL characters */}
                {gameState.towers.map(tower => (
                    <div 
                        key={`level-${tower.id}`}
                        style={{
                            position: 'absolute',
                            width: 'calc(100% / 12)',
                            height: 'calc(100% / 12)',
                            transform: `translate(${tower.x * 100}%, ${tower.y * 100}%)`,
                            pointerEvents: 'none',
                            zIndex: 30
                        }}
                    >
                        <div className="tower-level">Lv.{tower.level}</div>
                    </div>
                ))}

                {/* Render Enemies as absolute overlays on the board */}
                {gameState.enemies.map(enemy => {
                    let sprite = toDownImg;
                    if (enemy.direction === 'up') sprite = toUpImg;
                    else if (enemy.direction === 'left' || enemy.direction === 'right') sprite = toLeftImg;

                    return (
                        <div 
                            key={`enemy-${enemy.id}`} 
                            className={`enemy ${enemy.isHit ? 'hit' : ''} ${enemy.isBurned ? 'burned' : ''} ${enemy.isFrozen ? 'frozen' : ''} ${enemy.isSlowed && !enemy.isFrozen ? 'slowed' : ''}`}
                            style={{
                                transform: `translate(${enemy.x * 100}%, ${enemy.y * 100}%)`
                            }}
                        >
                            <div className="enemy-sprite-wrapper" style={{
                                transform: enemy.direction === 'left' ? 'scaleX(-1)' : 'none'
                            }}>
                                <img 
                                    src={sprite} 
                                    className="enemy-sprite"
                                    alt="enemy"
                                    style={{
                                        '--frames': 4
                                    } as React.CSSProperties}
                                />
                            </div>
                            <div className="hp-bar">
                                <div className="hp-fill" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                            </div>
                        </div>
                    );
                })}

                {/* Global Damage Texts Overlay */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
                    {gameState.enemies.map(enemy => (
                        <div key={`dmg-container-${enemy.id}`} style={{
                            position: 'absolute',
                            width: 'calc(100% / 12)',
                            height: 'calc(100% / 12)',
                            transform: `translate(${enemy.x * 100}%, ${enemy.y * 100}%)`,
                            pointerEvents: 'none'
                        }}>
                            {enemy.damageTexts && enemy.damageTexts.map((dt: any) => (
                                <div key={dt.id} className={`damage-text ${dt.type}`}>
                                    {dt.amount}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Tower Info Panel */}
            {selectedTowerId !== null && (
                <div className="tower-info-panel">
                    {(() => {
                        const selectedTower = gameState.towers.find(t => t.id === selectedTowerId);
                        if (!selectedTower) return null;
                        
                        const weaponNames: Record<string, string> = {
                            '검': '검',
                            '표창': '표창',
                            '마법구': '마법'
                        };
                        const traitDescs: Record<string, string> = {
                            '불': '적중 시 2초간 화상 (지속 피해)',
                            '빙결': '적중 시 둔화 및 확률적 빙결',
                            '바람': '적중 시 확률적 넉백 (무기 레벨 비례)',
                            '빛': '주기적으로 주변 아군 공속 증가',
                            '어둠': '주기적으로 주변 아군 데미지 증가'
                        };

                        return (
                            <div className="info-grid">
                                <h3>캐릭터 상세 정보</h3>
                                <ul>
                                    <li><strong>이름</strong> {selectedTower.name}</li>
                                    <li><strong>공격 형태</strong> {weaponNames[selectedTower.weaponType] || selectedTower.weaponType}</li>
                                    <li><strong>공격 범위</strong> {(selectedTower.range || 0.9).toFixed(1)} 타일</li>
                                    <li><strong>공격력</strong> {selectedTower.damage}</li>
                                    <li><strong>무기 레벨</strong> {selectedTower.level || 1}</li>
                                    <li className="full-width"><strong>속성 효과</strong> <span className="trait-desc">{traitDescs[selectedTower.type] || ''}</span></li>
                                </ul>
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
}
