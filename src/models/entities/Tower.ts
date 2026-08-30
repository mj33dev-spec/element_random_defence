import { BaseWeapon, WeaponType, ElementType, WeaponFactory } from './Weapon';

/**
 * Abstract Base Class for Tower
 */
export abstract class BaseTower {
    abstract readonly name: string;
    abstract readonly type: ElementType;
    abstract readonly visualType: number;
    abstract readonly attackSpeed: number;

    id: number;
    x: number;
    y: number;
    lastAttackTime: number;
    isAttacking: boolean;
    attackTimer: number;
    direction: string;
    orbitSpeed: number;
    hitCooldowns: Map<number, number>;
    magicSpawnTimer: number;

    // Buffs
    buffTimer: number;
    bonusAttackSpeed: number;
    bonusDamage: number;
    
    // Weapon Composition
    weaponModel: BaseWeapon;

    constructor(id: number, x: number, y: number, weaponModel?: BaseWeapon) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.lastAttackTime = 0;
        this.isAttacking = false;
        this.attackTimer = 0;
        this.direction = 'right';
        
        // Use provided weapon model or create a random level 1 weapon
        if (weaponModel) {
            this.weaponModel = weaponModel;
        } else {
            const weaponTypes = [WeaponType.SWORD, WeaponType.SHURIKEN, WeaponType.MAGIC_BALL];
            const randomType = weaponTypes[Math.floor(Math.random() * weaponTypes.length)];
            this.weaponModel = WeaponFactory.create(randomType, 1);
        }
        
        this.orbitSpeed = 180;
        this.hitCooldowns = new Map();
        this.magicSpawnTimer = 0;

        this.buffTimer = 0;
        this.bonusAttackSpeed = 0;
        this.bonusDamage = 0;
    }

    get damage(): number { return this.weaponModel.damage; }
    get range(): number { return this.weaponModel.range; }
    get orbitRadius(): number { return this.weaponModel.range; }
    get level(): number { return this.weaponModel.level; }
    get weaponType(): WeaponType { return this.weaponModel.type; }

    abstract getDamage(): number;

    updateBuffs(deltaTime: number) {
        if (this.buffTimer > 0) {
            this.buffTimer -= deltaTime;
            if (this.buffTimer <= 0) {
                this.bonusAttackSpeed = 0;
                this.bonusDamage = 0;
            }
        }
    }

    canAttack(currentTime: number): boolean {
        const totalAttackSpeed = this.attackSpeed + this.bonusAttackSpeed;
        const cooldown = 1000 / totalAttackSpeed;
        return currentTime - this.lastAttackTime >= cooldown;
    }

    attack(target: any, currentTime: number): number {
        this.lastAttackTime = currentTime;
        const dmg = this.getDamage();
        target.takeDamage(dmg);
        return dmg; 
    }

    toDTO(): any {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            name: this.name,
            type: this.type,
            level: this.level,
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed,
            isAttacking: this.isAttacking,
            direction: this.direction,
            visualType: this.visualType,
            weaponType: this.weaponType,
            weapons: this.weaponModel.orbits
        };
    }
}

// Concrete Elemental Towers
export class FireTower extends BaseTower {
    readonly name = "이프리트 (불)";
    readonly type = ElementType.FIRE;
    readonly visualType = 2;
    readonly attackSpeed = 1.0;

    constructor(id: number, x: number, y: number, weaponModel?: BaseWeapon) {
        super(id, x, y, weaponModel); 
    }
    getDamage(): number { 
        const base = this.damage + this.bonusDamage;
        return Math.max(1, Math.floor(base * (0.8 + Math.random() * 0.4)));
    }
}

export class IceTower extends BaseTower {
    readonly name = "운디네 (빙결)";
    readonly type = ElementType.ICE;
    readonly visualType = 4;
    readonly attackSpeed = 1.0;

    constructor(id: number, x: number, y: number, weaponModel?: BaseWeapon) {
        super(id, x, y, weaponModel); 
    }
    getDamage(): number { 
        const base = this.damage + this.bonusDamage;
        return Math.max(1, Math.floor(base * (0.8 + Math.random() * 0.4)));
    }
}

export class WindTower extends BaseTower {
    readonly name = "실프 (바람)";
    readonly type = ElementType.WIND;
    readonly visualType = 3;
    readonly attackSpeed = 1.0;

    constructor(id: number, x: number, y: number, weaponModel?: BaseWeapon) {
        super(id, x, y, weaponModel); 
    }
    getDamage(): number { 
        const base = this.damage + this.bonusDamage;
        return Math.max(1, Math.floor(base * (0.8 + Math.random() * 0.4)));
    }
}

export class LightTower extends BaseTower {
    readonly name = "루미너스 (빛)";
    readonly type = ElementType.LIGHT;
    readonly visualType = 0;
    readonly attackSpeed = 1.0;

    constructor(id: number, x: number, y: number, weaponModel?: BaseWeapon) {
        super(id, x, y, weaponModel); 
    }
    getDamage(): number { 
        const base = this.damage + this.bonusDamage;
        return Math.max(1, Math.floor(base * (0.8 + Math.random() * 0.4)));
    }
}

export class DarkTower extends BaseTower {
    readonly name = "녹턴 (어둠)";
    readonly type = ElementType.DARK;
    readonly visualType = 1;
    readonly attackSpeed = 1.0;

    constructor(id: number, x: number, y: number, weaponModel?: BaseWeapon) {
        super(id, x, y, weaponModel); 
    }
    getDamage(): number { 
        const base = this.damage + this.bonusDamage;
        return Math.max(1, Math.floor(base * (0.8 + Math.random() * 0.4)));
    }
}

export const TOWER_CLASSES = [FireTower, IceTower, WindTower, LightTower, DarkTower];
