export interface Obstacle {
  type: 'rect' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  moving?: boolean;
  moveSpeed?: number;
  moveRange?: number;
  moveDirection?: 'horizontal' | 'vertical';
}

export interface Level {
  name: string;
  start: { x: number; y: number };
  hole: { x: number; y: number; radius: number };
  obstacles: Obstacle[];
  friction: number;
}

export const levels: Level[] = [
  {
    name: "Level 1: The Beginning",
    start: { x: 100, y: 300 },
    hole: { x: 700, y: 300, radius: 20 },
    obstacles: [
      { type: 'rect', x: 350, y: 200, width: 100, height: 30, color: '#1f2937' },
      { type: 'rect', x: 350, y: 370, width: 100, height: 30, color: '#1f2937' },
    ],
    friction: 0.98,
  },
  {
    name: "Level 2: The Corridor",
    start: { x: 100, y: 100 },
    hole: { x: 700, y: 500, radius: 20 },
    obstacles: [
      { type: 'rect', x: 200, y: 150, width: 30, height: 350, color: '#374151' },
      { type: 'rect', x: 400, y: 100, width: 30, height: 350, color: '#374151' },
      { type: 'rect', x: 570, y: 150, width: 30, height: 350, color: '#374151' },
    ],
    friction: 0.98,
  },
  {
    name: "Level 3: The Maze",
    start: { x: 100, y: 500 },
    hole: { x: 700, y: 100, radius: 20 },
    obstacles: [
      { type: 'rect', x: 150, y: 100, width: 500, height: 30, color: '#4b5563' },
      { type: 'rect', x: 150, y: 250, width: 300, height: 30, color: '#4b5563' },
      { type: 'rect', x: 350, y: 400, width: 300, height: 30, color: '#4b5563' },
      { type: 'rect', x: 250, y: 350, width: 30, height: 200, color: '#4b5563' },
      { type: 'rect', x: 550, y: 150, width: 30, height: 200, color: '#4b5563' },
    ],
    friction: 0.98,
  },
  {
    name: "Level 4: Moving Walls",
    start: { x: 100, y: 300 },
    hole: { x: 700, y: 300, radius: 20 },
    obstacles: [
      { type: 'rect', x: 300, y: 150, width: 30, height: 120, color: '#ef4444' },
      { type: 'rect', x: 300, y: 330, width: 30, height: 120, color: '#ef4444' },
      { type: 'rect', x: 500, y: 200, width: 30, height: 200, color: '#f59e0b' },
    ],
    friction: 0.98,
  },
  {
    name: "Level 5: The Final Challenge",
    start: { x: 100, y: 500 },
    hole: { x: 700, y: 100, radius: 20 },
    obstacles: [
      { type: 'rect', x: 200, y: 400, width: 150, height: 30, color: '#6366f1' },
      { type: 'rect', x: 450, y: 450, width: 150, height: 30, color: '#6366f1' },
      { type: 'rect', x: 250, y: 250, width: 30, height: 100, color: '#8b5cf6' },
      { type: 'rect', x: 450, y: 200, width: 30, height: 150, color: '#8b5cf6' },
      { type: 'rect', x: 550, y: 300, width: 100, height: 30, color: '#ec4899' },
      { type: 'rect', x: 350, y: 100, width: 200, height: 30, color: '#ec4899' },
      { type: 'rect', x: 150, y: 150, width: 80, height: 80, color: '#14b8a6' },
      { type: 'rect', x: 600, y: 400, width: 80, height: 80, color: '#14b8a6' },
    ],
    friction: 0.97,
  },
];
