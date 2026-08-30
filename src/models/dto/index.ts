export class EnemyDTO {
    id: number;
    x: number;
    y: number;
    hp: number;
    maxHp: number;
    speed: number;
    type: string;
    progress: number;
    pathIndex: number;
    direction: string;
    isHit: boolean;
    isBurned: boolean;
    isSlowed: boolean;
    isFrozen: boolean;
    damageTexts: { id: number; amount: number; timer: number; type: string }[];

    constructor(enemy: any) {
        this.id = enemy.id;
        this.x = enemy.x;
        this.y = enemy.y;
        this.hp = enemy.hp;
        this.maxHp = enemy.maxHp;
        this.speed = enemy.speed;
        this.type = enemy.type;
        this.progress = enemy.progress;
        this.pathIndex = enemy.pathIndex;
        this.direction = enemy.direction;
        this.isHit = enemy.isHit;
        this.isBurned = enemy.isBurned || false;
        this.isSlowed = enemy.isSlowed || false;
        this.isFrozen = enemy.isFrozen || false;
        this.damageTexts = enemy.damageTexts ? enemy.damageTexts.map((dt: any) => ({ ...dt })) : [];
    }
}

export class TowerDTO {
    id: number;
    x: number;
    y: number;
    name: string;
    damage: number;
    range: number;
    attackSpeed: number;
    type: string;
    lastAttackTime: number;
    level: number;
    isAttacking: boolean;
    direction: string;
    visualType: number;
    weaponType: string;
    weapons: any[];

    constructor(tower: any) {
        this.id = tower.id;
        this.x = tower.x;
        this.y = tower.y;
        this.name = tower.name;
        this.damage = tower.damage;
        this.range = tower.range;
        this.attackSpeed = tower.attackSpeed;
        this.type = tower.type;
        this.lastAttackTime = tower.lastAttackTime;
        this.level = tower.level;
        this.isAttacking = tower.isAttacking;
        this.direction = tower.direction;
        this.visualType = tower.visualType;
        this.weaponType = tower.weaponType;
        this.weapons = tower.weaponModel ? tower.weaponModel.orbits : [];
    }
}

export class GameStateDTO {
    gold: number;
    lives: number;
    round: number;
    enemies: EnemyDTO[];
    towers: TowerDTO[];
    isGameOver: boolean;

    constructor(state?: any) {
        this.gold = state ? state.gold : 30;
        this.lives = state ? state.lives : 20;
        this.round = state ? state.round : 1;
        this.enemies = state ? state.enemies.map((e: any) => new EnemyDTO(e)) : [];
        this.towers = state ? state.towers.map((t: any) => new TowerDTO(t)) : [];
        this.isGameOver = state ? state.isGameOver : false;
    }
}
