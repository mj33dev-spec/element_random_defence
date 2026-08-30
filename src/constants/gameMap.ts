export const BOARD_WIDTH = 12;
export const BOARD_HEIGHT = 12;

export const PATH_COORDS = [
    // 1. 맨 왼쪽(x=0)에서 내려오기 (0,0 부터 0,4 까지)
    ...Array.from({length: 5}, (_, i) => ({x: 0, y: i})),
    
    // 2. 0,4 좌표에서 우측으로 이동 (11,4 까지)
    ...Array.from({length: 11}, (_, i) => ({x: i + 1, y: 4})),

    // 3. 11,4 좌표에 도달하면 위로 올라가기 (11,0 까지)
    ...Array.from({length: 4}, (_, i) => ({x: 11, y: 3 - i})),

    // 4. 11,0에 도달하면 7,0으로 왼쪽 이동
    ...Array.from({length: 4}, (_, i) => ({x: 10 - i, y: 0})),

    // 5. 7,0에 도달하면 아래로 일직선으로 내려가기 (7,11 까지)
    ...Array.from({length: 11}, (_, i) => ({x: 7, y: i + 1})),

    // 6. 7,11 위치에서 11,11 위치로 우측 이동
    ...Array.from({length: 4}, (_, i) => ({x: i + 8, y: 11})),

    // 7. 11,11 위치에서 11,7 위치로 위로 이동
    ...Array.from({length: 4}, (_, i) => ({x: 11, y: 10 - i})),

    // 8. 11,7 위치에서 0,7 위치로 좌측 이동
    ...Array.from({length: 11}, (_, i) => ({x: 10 - i, y: 7})),

    // 9. 0,7 위치에서 0,11 위치로 아래로 이동
    ...Array.from({length: 4}, (_, i) => ({x: 0, y: i + 8})),

    // 10. 0,11 위치에서 4,11 위치로 우측 이동
    ...Array.from({length: 4}, (_, i) => ({x: i + 1, y: 11})),

    // 11. 4,11 위치에서 4,0 위치까지 위로 쭉 올라가기 (도달 시 라이프 차감)
    ...Array.from({length: 11}, (_, i) => ({x: 4, y: 10 - i}))
];

export const isPath = (x, y) => PATH_COORDS.some(p => p.x === x && p.y === y);

export const isBuildable = (x, y) => {
    if (isPath(x, y)) return false;

    // Row 1 (Top blocks)
    if (y >= 0 && y <= 3) {
        if (y >= 1 && x >= 1 && x <= 3) return true; // 3x3
        if (x >= 5 && x <= 6) return true;           // 2x4 (extends up)
        if (y >= 1 && x >= 8 && x <= 10) return true;// 3x3
    }
    // Row 2 (Middle blocks)
    if (y >= 5 && y <= 6) {
        if (x >= 0 && x <= 3) return true;  // 4x2 (extends left)
        if (x >= 5 && x <= 6) return true;  // 2x2
        if (x >= 8 && x <= 11) return true; // 4x2 (extends right)
    }
    // Row 3 (Bottom blocks)
    if (y >= 8 && y <= 11) {
        if (y <= 10 && x >= 1 && x <= 3) return true; // 3x3
        if (x >= 5 && x <= 6) return true;            // 2x4 (extends down)
        if (y <= 10 && x >= 8 && x <= 10) return true;// 3x3
    }
    
    return false;
};
