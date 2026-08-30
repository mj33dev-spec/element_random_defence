import { PATH_COORDS } from '../../constants/gameMap.ts';

/**
 * Abstract Base Class for Enemy
 */
export class BaseEnemy {
    id: number;
    type: string;
    hp: number;
    maxHp: number;
    speed: number;
    x: number;
    y: number;
    pathIndex: number;
    progress: number;
    direction: string;
    hitTimer: number;

    // Status effects
    burnTimer: number;
    burnDamagePerSec: number;
    slowTimer: number;
    slowMultiplier: number;
    freezeTimer: number;

    // Damage Texts
    damageTexts: { id: number; amount: number; timer: number; type: string }[];
    burnTickTimer: number;
    accumulatedBurnDmg: number;

    constructor(id: number, type: string, hp: number, speed: number) {
        this.id = id;
        this.type = type;
        this.hp = hp;
        this.maxHp = hp;
        this.speed = speed;
        // Start at first path point
        this.x = PATH_COORDS[0].x;
        this.y = PATH_COORDS[0].y;
        this.pathIndex = 0;
        this.progress = 0; // 0.0 to 1.0 between current and next path point
        this.direction = 'right'; // visual direction
        this.hitTimer = 0;
        
        this.burnTimer = 0;
        this.burnDamagePerSec = 0;
        this.slowTimer = 0;
        this.slowMultiplier = 1.0;
        this.freezeTimer = 0;

        this.damageTexts = [];
        this.burnTickTimer = 0;
        this.accumulatedBurnDmg = 0;
    }

    takeDamage(amount: number) {
        this.hp -= amount;
        this.hitTimer = 150; // 150ms 동안 피격 애니메이션 상태 유지
        if (this.hp < 0) this.hp = 0;
        
        // 데미지 텍스트 생성 (800ms 수명)
        this.damageTexts.push({
            id: Math.random(),
            amount: Math.floor(amount),
            timer: 800,
            type: 'normal'
        });
    }

    isDead() {
        return this.hp <= 0;
    }

    updateStatus(deltaTime: number) {
        // 데미지 텍스트 수명 깎기
        for (let i = this.damageTexts.length - 1; i >= 0; i--) {
            this.damageTexts[i].timer -= deltaTime;
            if (this.damageTexts[i].timer <= 0) {
                this.damageTexts.splice(i, 1);
            }
        }

        if (this.burnTimer > 0) {
            this.burnTimer -= deltaTime;
            const burnDmg = this.burnDamagePerSec * (deltaTime / 1000);
            this.hp -= burnDmg;
            this.accumulatedBurnDmg += burnDmg;
            this.burnTickTimer += deltaTime;
            
            // 0.5초마다 화상 데미지 틱 띄우기
            if (this.burnTickTimer >= 500) {
                if (this.accumulatedBurnDmg >= 1) {
                    this.damageTexts.push({
                        id: Math.random(),
                        amount: Math.floor(this.accumulatedBurnDmg),
                        timer: 800,
                        type: 'burn'
                    });
                }
                this.accumulatedBurnDmg = 0;
                this.burnTickTimer = 0;
            }

            if (this.hp < 0) this.hp = 0;
        }
        if (this.slowTimer > 0) this.slowTimer -= deltaTime;
        if (this.freezeTimer > 0) this.freezeTimer -= deltaTime;
    }

    getSpeed(): number {
        if (this.freezeTimer > 0) return 0;
        if (this.slowTimer > 0) return this.speed * this.slowMultiplier;
        return this.speed;
    }

    applyKnockback(distance: number) {
        this.progress -= distance;
        // Handle pushing back across previous waypoints
        while (this.progress < 0) {
            if (this.pathIndex > 0) {
                this.pathIndex--;
                this.progress += 1.0; 
            } else {
                this.progress = 0;
                break;
            }
        }
    }

    toDTO(): any {
        return {
            id: this.id,
            type: this.type,
            x: this.x,
            y: this.y,
            hp: this.hp,
            maxHp: this.maxHp,
            speed: this.speed,
            pathIndex: this.pathIndex,
            progress: this.progress,
            direction: this.direction,
            isHit: this.hitTimer > 0,
            isBurned: this.burnTimer > 0,
            isSlowed: this.slowTimer > 0,
            isFrozen: this.freezeTimer > 0,
            damageTexts: this.damageTexts.map(dt => ({ ...dt }))
        };
    }
}

export class NormalEnemy extends BaseEnemy {
    constructor(id: number, round: number) {
        // Base stats scale with round
        const hp = 50 + (round * 20);
        const speed = 1.0;
        super(id, "SLIME", hp, speed);
    }
}
