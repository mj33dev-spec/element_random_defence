import { useEffect, useState, useRef } from 'react';
import { GameEngine } from '../engine/GameEngine.ts';
import { GameStateDTO } from '../models/dto/index.ts';

export interface QuestToast {
    id: string;
    title: string;
    rewardGold: number;
    timestamp: number;
}

export function useGameLoop() {
    const [gameState, setGameState] = useState(new GameStateDTO());
    const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());
    const [toastMessage, setToastMessage] = useState<QuestToast | null>(null);
    const engineRef = useRef<GameEngine | null>(null);

    useEffect(() => {
        // Initialize Engine
        engineRef.current = new GameEngine((newState) => {
            setGameState(newState);
        });

        // Wire up quest completion callback
        engineRef.current.onQuestCompleted = (questId: string, title: string, rewardGold: number) => {
            setCompletedQuests(prev => {
                const newSet = new Set(prev);
                newSet.add(questId);
                return newSet;
            });
            
            // Set toast data to trigger notification in UI
            setToastMessage({
                id: questId,
                title,
                rewardGold,
                timestamp: Date.now()
            });
        };

        engineRef.current.start();

        return () => {
            engineRef.current?.stop();
        };
    }, []);

    const buildTower = (x: number, y: number) => {
        if (engineRef.current) {
            return engineRef.current.buildTower(x, y);
        }
        return false;
    };

    const mergeTowers = (sourceId: number, targetId: number) => {
        if (engineRef.current) {
            return engineRef.current.mergeTowers(sourceId, targetId);
        }
        return false;
    };

    const moveTower = (towerId: number, x: number, y: number) => {
        if (engineRef.current) {
            return engineRef.current.moveTower(towerId, x, y);
        }
        return false;
    };

    return { 
        gameState, 
        completedQuests, 
        toastMessage, 
        buildTower, 
        mergeTowers, 
        moveTower 
    };
}
