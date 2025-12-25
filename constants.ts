
import { GameSettings } from './types';

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 600;

export const DEFAULT_SETTINGS: GameSettings = {
  gravity: 0.5,       // Slightly floatier for easier mobile play
  jumpForce: -7.5,
  pipeSpeed: 3.2,     // Slightly slower
  pipeWidth: 65,
  gapHeight: 190,     // Slightly wider gap for mobile users
  spawnRate: 100,      // Longer time between pipes
};

export const BIRD_SIZE = 50;
export const OBSTACLE_FACE_SIZE = 60;
