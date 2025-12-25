
export enum GameState {
  START = 'START',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export interface Pipe {
  x: number;
  topHeight: number;
  passed: boolean;
}

export interface GameSettings {
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  pipeWidth: number;
  gapHeight: number;
  spawnRate: number; // in frames
}
