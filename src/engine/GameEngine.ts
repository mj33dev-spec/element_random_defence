import { PATH_COORDS } from '../constants/gameMap.ts';
import { GameStateDTO } from '../models/dto/index.ts';
import { NormalEnemy, BaseEnemy } from '../models/entities/Enemy.ts';
import { TOWER_CLASSES, BaseTower } from '../models/entities/Tower.ts';
import { WeaponFactory, WeaponType, ElementType } from '../models/entities/Weapon.ts';
import questsData from '../data/quests.json';
import elementTraits from '../data/element_traits.json';

export class GameEngine {
    gold: number;
    lives: number;
    round: number;
    enemies: BaseEnemy[];
    towers: BaseTower[];
    isGameOver: boolean;
    onStateChange: (state: GameStateDTO) => void;
    
    enemiesToSpawn: number;
    spawnTimer: number;
    spawnInterval: number;
    
    lastTime: number;
    animationFrameId: number | null;
    enemyIdCounter: number;
    towerIdCounter: number;
    
    // Quest management
    completedQuests: Set<string>;
    onQuestCompleted: ((questId: string, title: string, rewardGold: number) => void) | null;

    constructor(onStateChange: (state: GameStateDTO) => void) {
        this.gold = 40;
        this.lives = 20;
        this.round = 1;
        this.enemies = [];
        this.towers = [];
        this.isGameOver = false;

        this.onStateChange = onStateChange; // callback to update React
        this.completedQuests = new Set();
        this.onQuestCompleted = null;

        // Wave management
        this.enemiesToSpawn = 0;
        this.spawnTimer = 0;
        this.spawnInterval = 1000; // ms between spawns
        
        // Loop management
        this.lastTime = performance.now();
        this.animationFrameId = null;
        this.enemyIdCounter = 0;
        this.towerIdCounter = 0;

        this.startRound();
    }

    startRound() {
        this.enemiesToSpawn = 20;
        this.spawnTimer = 0;
    }

    buildTower(x, y) {
        if (this.gold < 10) return false;
        
        // Random class from 0 to 5
        const RandomClass = TOWER_CLASSES[Math.floor(Math.random() * TOWER_CLASSES.length)];
        const newTower = new RandomClass(this.towerIdCounter++, x, y);
        
        this.gold -= 10;
        this.towers.push(newTower);
        this.checkQuests();
        this.notifyState();
        return true;
    }

    mergeTowers(sourceId: number, targetId: number) {
        if (sourceId === targetId) return false;

        const sourceIndex = this.towers.findIndex(t => t.id === sourceId);
        const targetIndex = this.towers.findIndex(t => t.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1) return false;

        const sourceTower = this.towers[sourceIndex];
        const targetTower = this.towers[targetIndex];

        // 1. 합성은 캐릭터 속성(visualType)과 레벨이 정확히 같을 때만 가능합니다.
        const canMerge = sourceTower.visualType === targetTower.visualType && 
                         sourceTower.level === targetTower.level && 
                         sourceTower.level < 5;
        
        if (!canMerge) {
            // 합성이 불가능하다면 위치를 서로 교환(Swap)합니다.
            const tempX = sourceTower.x;
            const tempY = sourceTower.y;
            sourceTower.x = targetTower.x;
            sourceTower.y = targetTower.y;
            targetTower.x = tempX;
            targetTower.y = tempY;
            this.notifyState();
            return true; // 동작 수행 완료
        }

        // 2. 합성 성공 - 새로운 무기 결정
        let selectedWeaponType: WeaponType;
        if (sourceTower.weaponType === targetTower.weaponType) {
            // 같은 무기일 경우 그대로 유지
            selectedWeaponType = targetTower.weaponType;
        } else {
            // 다른 무기일 경우 50:50 확률로 결정
            selectedWeaponType = Math.random() > 0.5 ? sourceTower.weaponType : targetTower.weaponType;
        }

        // 새로운 무기 인스턴스 생성 (레벨 + 1)
        const nextLevel = targetTower.level + 1;
        const newWeapon = WeaponFactory.create(selectedWeaponType, nextLevel);

        // 새로운 타워 생성 (타겟 타워의 x, y 유지)
        const SelectedClass = targetTower.constructor as any;
        const newTower = new SelectedClass(
            this.towerIdCounter++, 
            targetTower.x, 
            targetTower.y, 
            newWeapon
        );

        // 기존 타워 2개 제거 후 새 타워 추가
        // 뒤에서부터 지워야 인덱스가 꼬이지 않습니다.
        const maxIdx = Math.max(sourceIndex, targetIndex);
        const minIdx = Math.min(sourceIndex, targetIndex);
        this.towers.splice(maxIdx, 1);
        this.towers.splice(minIdx, 1);
        
        this.towers.push(newTower);
        this.checkQuests();
        this.notifyState();
        return true;
    }

    moveTower(towerId: number, x: number, y: number) {
        const tower = this.towers.find(t => t.id === towerId);
        if (!tower) return false;

        // 타겟 위치에 다른 타워가 있는지 확인 (합성이 아닌 순수 이동이므로 비어있어야 함)
        const targetTower = this.towers.find(t => t.x === x && t.y === y);
        if (targetTower) return false;

        // 위치 갱신
        tower.x = x;
        tower.y = y;
        this.notifyState();
        return true;
    }

    update(currentTime: number) {
        if (this.isGameOver) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.handleSpawns(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateTowers(currentTime, deltaTime);

        this.checkRoundEnd();
        this.notifyState();
        
        this.animationFrameId = requestAnimationFrame((t) => this.update(t));
    }

    handleSpawns(deltaTime) {
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                this.enemiesToSpawn--;
                
                const newEnemy = new NormalEnemy(this.enemyIdCounter++, this.round);
                // Start at first path node
                newEnemy.x = PATH_COORDS[0].x;
                newEnemy.y = PATH_COORDS[0].y;
                this.enemies.push(newEnemy);
            }
        }
    }

    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            enemy.updateStatus(deltaTime);
            
            if (enemy.isDead()) {
                this.gold += 1;
                this.enemies.splice(i, 1);
                continue;
            }

            if (enemy.hitTimer > 0) {
                enemy.hitTimer -= deltaTime;
            }

            const currentPos = PATH_COORDS[enemy.pathIndex];
            const nextPos = PATH_COORDS[enemy.pathIndex + 1];

            if (!nextPos) {
                // Reached the end
                this.lives--;
                this.enemies.splice(i, 1);
                if (this.lives <= 0) {
                    this.isGameOver = true;
                }
                continue;
            }

            if (nextPos.x > currentPos.x) enemy.direction = 'right';
            else if (nextPos.x < currentPos.x) enemy.direction = 'left';
            else if (nextPos.y > currentPos.y) enemy.direction = 'down';
            else if (nextPos.y < currentPos.y) enemy.direction = 'up';

            // Move towards next node
            // Speed = tiles per second
            const moveAmount = (enemy.getSpeed() * deltaTime) / 1000;
            enemy.progress += moveAmount;

            if (enemy.progress >= 1.0) {
                // Reached next node
                enemy.pathIndex++;
                enemy.progress = 0;
                enemy.x = nextPos.x;
                enemy.y = nextPos.y;
            } else {
                // Interpolate visual position
                enemy.x = currentPos.x + (nextPos.x - currentPos.x) * enemy.progress;
                enemy.y = currentPos.y + (nextPos.y - currentPos.y) * enemy.progress;
            }
        }
    }

    updateTowers(currentTime, deltaTime) {
        for (const tower of this.towers) {
            tower.updateBuffs(deltaTime);

            // Apply Light/Dark Aura Buffs
            if (tower.type === ElementType.LIGHT || tower.type === ElementType.DARK) {
                // 방어 코드: JSON 핫리로딩 지연 시 구버전 키값(LIGHT)도 체크
                const trait = (elementTraits as any)[tower.type] || (elementTraits as any)[tower.type === ElementType.LIGHT ? 'LIGHT' : 'DARK'];
                
                if (trait) {
                    if (!(tower as any).auraTimer) (tower as any).auraTimer = 0;
                    (tower as any).auraTimer += deltaTime;
                    if ((tower as any).auraTimer >= trait.auraIntervalMs) {
                        (tower as any).auraTimer -= trait.auraIntervalMs;
                        // Apply buff to nearby allies
                        for (const ally of this.towers) {
                            const dx = ally.x - tower.x;
                            const dy = ally.y - tower.y;
                            if (Math.sqrt(dx * dx + dy * dy) <= trait.auraRadius) {
                                ally.buffTimer = trait.buffDurationMs;
                                if (tower.type === ElementType.LIGHT) ally.bonusAttackSpeed = trait.attackSpeedBonus;
                                if (tower.type === ElementType.DARK) ally.bonusDamage = trait.damageBonus;
                            }
                        }
                    }
                }
            }

            // Handle character attack animation timer
            if (tower.isAttacking) {
                tower.attackTimer -= deltaTime;
                if (tower.attackTimer <= 0) {
                    tower.isAttacking = false;
                }
            }

            // Spawn magic balls (weaponType "마법구") over time
            if (tower.weaponType === WeaponType.MAGIC_BALL) {
                tower.magicSpawnTimer += deltaTime;
                if (tower.magicSpawnTimer >= 1000) {
                    tower.magicSpawnTimer -= 1000;
                    if (tower.weaponModel.orbits.length < 5) {
                        // Spawn new magic ball at a random angle
                        tower.weaponModel.orbits.push({ angle: Math.random() * 360, active: true });
                    }
                }
            }

            // Update all active weapons and check collisions
            for (let i = tower.weaponModel.orbits.length - 1; i >= 0; i--) {
                const weapon = tower.weaponModel.orbits[i];
                if (!weapon.active) {
                    tower.weaponModel.orbits.splice(i, 1);
                    continue;
                }

                // Update weapon rotation
                weapon.angle = (weapon.angle + tower.orbitSpeed * (deltaTime / 1000)) % 360;
                
                // Calculate weapon absolute position in grid coordinates
                // CSS starts at 12 o'clock (top: -80%) and rotates clockwise around the center of the tile.
                // Center of the tower tile:
                const towerCenterX = tower.x + 0.5;
                const towerCenterY = tower.y + 0.5;
                
                // Math conversion: 0deg = Up (X=0, Y=-R), 90deg = Right (X=R, Y=0).
                const angleRad = weapon.angle * (Math.PI / 180);
                const weaponX = towerCenterX + Math.sin(angleRad) * tower.orbitRadius;
                const weaponY = towerCenterY - Math.cos(angleRad) * tower.orbitRadius;

                // Check collision between this specific weapon and enemies
                for (const enemy of this.enemies) {
                    // Center of the enemy:
                    const enemyCenterX = enemy.x + 0.5;
                    const enemyCenterY = enemy.y + 0.5;

                    const dx = enemyCenterX - towerCenterX;
                    const dy = enemyCenterY - towerCenterY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // Check if the enemy is within the radial band of the weapon
                    // Weapon spans roughly from radius 0.5 to 1.3. We add 0.4 margin for the enemy's own body size.
                    if (distance >= 0.3 && distance <= 1.5) {
                        // Calculate angle of the enemy relative to the tower
                        // dx = sin(A), -dy = cos(A) matching our 12 o'clock = 0deg system
                        let enemyAngle = Math.atan2(dx, -dy) * (180 / Math.PI);
                        if (enemyAngle < 0) enemyAngle += 360;

                        // Calculate shortest angular difference
                        let angleDiff = Math.abs(weapon.angle - enemyAngle);
                        if (angleDiff > 180) angleDiff = 360 - angleDiff;

                        // Collision threshold: 35 degrees (creates a 70-degree sweeping hit cone)
                        if (angleDiff <= 35) {
                            const lastHit = tower.hitCooldowns.get(enemy.id) || 0;
                            // 500ms cooldown per enemy
                            if (currentTime - lastHit >= 500) {
                                tower.attack(enemy, currentTime);
                                tower.hitCooldowns.set(enemy.id, currentTime);
                                
                                // Apply Elemental Hit Effects
                                const traits = (elementTraits as any)[tower.type];
                                if (traits) {
                                    if (tower.type === ElementType.FIRE) {
                                        enemy.burnTimer = traits.burnDurationMs;
                                        enemy.burnDamagePerSec = traits.burnDamagePerSec;
                                    } else if (tower.type === ElementType.ICE) {
                                        enemy.slowTimer = traits.slowDurationMs;
                                        enemy.slowMultiplier = traits.slowMultiplier;
                                        if (Math.random() < traits.freezeChance) {
                                            enemy.freezeTimer = traits.freezeDurationMs;
                                        }
                                    } else if (tower.type === ElementType.WIND) {
                                        if (Math.random() < traits.knockbackChance) {
                                            enemy.applyKnockback(traits.knockbackBaseDistance + (traits.knockbackLevelMultiplier * tower.level));
                                        }
                                    }
                                }

                                // Trigger visual attack state on character
                                tower.isAttacking = true;
                                tower.attackTimer = 300;
                                tower.direction = enemy.x < tower.x ? 'left' : 'right';

                                // Magic balls disappear on hit
                                if (tower.weaponType === WeaponType.MAGIC_BALL) {
                                    weapon.active = false;
                                    break; // This weapon is destroyed, stop checking other enemies for this weapon
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    checkRoundEnd() {
        if (this.enemiesToSpawn === 0 && this.enemies.length === 0 && !this.isGameOver) {
            this.round++;
            this.gold += 20;
            this.startRound();
        }
    }

    checkQuests() {
        if (!this.onQuestCompleted) return;

        for (const quest of questsData) {
            if (this.completedQuests.has(quest.id)) continue;
            let achieved = false;

            if (quest.type === "COLLECT_ALL_ELEMENTS") {
                const targetLvl = quest.targetLevel;
                const elements = new Set(this.towers.filter(t => t.level === targetLvl).map(t => t.type));
                if (elements.size >= 5) achieved = true;
            } else if (quest.type === "COLLECT_ALL_WEAPONS") {
                const weapons = new Set(this.towers.map(t => t.weaponType));
                if (weapons.size >= 3) achieved = true;
            } else if (quest.type === "REACH_LEVEL") {
                const targetLvl = quest.targetLevel;
                if (this.towers.some(t => t.level >= targetLvl)) achieved = true;
            }

            if (achieved) {
                this.completedQuests.add(quest.id);
                this.gold += quest.rewardGold;
                this.onQuestCompleted(quest.id, quest.title, quest.rewardGold);
            }
        }
    }

    start() {
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame((t) => this.update(t));
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    notifyState() {
        const dto = new GameStateDTO();
        dto.gold = this.gold;
        dto.lives = this.lives;
        dto.round = this.round;
        dto.isGameOver = this.isGameOver;
        dto.enemies = this.enemies.map(e => e.toDTO());
        dto.towers = this.towers.map(t => t.toDTO());
        
        this.onStateChange(dto);
    }
}
