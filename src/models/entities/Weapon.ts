import weaponStats from '../../data/weapon_stats.json';

export enum WeaponType {
    SWORD = "검",
    SHURIKEN = "표창",
    MAGIC_BALL = "마법구"
}

export enum ElementType {
    FIRE = '불',
    ICE = '빙결',
    WIND = '바람',
    LIGHT = '빛',
    DARK = '어둠'
}

export interface WeaponOrbitData {
    angle: number;
    active: boolean;
}

export abstract class BaseWeapon {
    abstract readonly type: WeaponType;
    abstract readonly level: number;
    abstract readonly damage: number;
    abstract readonly range: number;
    
    // Weapon orbit instances
    orbits: WeaponOrbitData[] = [];

    constructor() {
        // Initialize orbit instances based on weapon type.
        this.orbits.push({ angle: Math.random() * 360, active: true });
    }
}

// Data-driven Generic Weapon Class
export class GenericWeapon extends BaseWeapon {
    readonly type: WeaponType;
    readonly level: number;
    readonly damage: number;
    readonly range: number;

    constructor(type: WeaponType, level: number) {
        super();
        this.type = type;
        
        // Ensure level doesn't exceed the max available in JSON
        const statsArray = (weaponStats as any)[type.toString()];
        const safeLevel = Math.min(level, statsArray.length);
        this.level = safeLevel;
        
        const stat = statsArray[safeLevel - 1];
        this.damage = stat.damage;
        this.range = stat.range;
    }
}

// Factory to easily create weapons using the generic class
export class WeaponFactory {
    static create(type: WeaponType, level: number): BaseWeapon {
        return new GenericWeapon(type, level);
    }
}
