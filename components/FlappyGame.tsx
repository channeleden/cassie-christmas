
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Pipe } from '../types';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  DEFAULT_SETTINGS, 
  BIRD_SIZE, 
  OBSTACLE_FACE_SIZE 
} from '../constants';

interface FlappyGameProps {
  gameState: GameState;
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  birdImageUrl: string | null;
  obstacleImageUrl: string | null;
}

const FlappyGame: React.FC<FlappyGameProps> = ({ 
  gameState, 
  onGameOver, 
  onScoreUpdate,
  birdImageUrl,
  obstacleImageUrl 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  
  const birdY = useRef(CANVAS_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const pipes = useRef<Pipe[]>([]);
  const frameCount = useRef(0);
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  const birdImg = useRef<HTMLImageElement | null>(null);
  const obstacleImg = useRef<HTMLImageElement | null>(null);

  // Load / Update images
  useEffect(() => {
    if (birdImageUrl) {
      const img = new Image();
      img.src = birdImageUrl;
      img.onload = () => { birdImg.current = img; };
    }
  }, [birdImageUrl]);

  useEffect(() => {
    if (obstacleImageUrl) {
      const img = new Image();
      img.src = obstacleImageUrl;
      img.onload = () => { obstacleImg.current = img; };
    }
  }, [obstacleImageUrl]);

  const resetGame = useCallback(() => {
    birdY.current = CANVAS_HEIGHT / 2;
    birdVelocity.current = 0;
    pipes.current = [];
    frameCount.current = 0;
    setScore(0);
    onScoreUpdate(0);
  }, [onScoreUpdate]);

  const jump = useCallback((e?: any) => {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    if (gameState === GameState.PLAYING) {
      birdVelocity.current = DEFAULT_SETTINGS.jumpForce;
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    
    const handleTouch = (e: TouchEvent) => {
      if (gameState === GameState.PLAYING && e.cancelable) {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('touchstart', handleTouch as any, { passive: false });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (canvas) {
        canvas.removeEventListener('touchstart', handleTouch as any);
      }
    };
  }, [jump, gameState]);

  const update = useCallback((deltaTime: number) => {
    if (gameState !== GameState.PLAYING) return;

    const speedFactor = deltaTime / (1000 / 60); 

    birdVelocity.current += DEFAULT_SETTINGS.gravity * speedFactor;
    birdY.current += birdVelocity.current * speedFactor;

    if (frameCount.current % DEFAULT_SETTINGS.spawnRate === 0) {
      const minPipeHeight = 100;
      const maxPipeHeight = CANVAS_HEIGHT - DEFAULT_SETTINGS.gapHeight - minPipeHeight - 40;
      const topHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
      pipes.current.push({
        x: CANVAS_WIDTH,
        topHeight: topHeight,
        passed: false
      });
    }

    pipes.current = pipes.current.filter(pipe => pipe.x > -DEFAULT_SETTINGS.pipeWidth);
    pipes.current.forEach(pipe => {
      pipe.x -= DEFAULT_SETTINGS.pipeSpeed * speedFactor;

      const birdRect = {
        left: 50 + 15,
        right: 50 + BIRD_SIZE - 15,
        top: birdY.current + 15,
        bottom: birdY.current + BIRD_SIZE - 15
      };

      const topPipeRect = {
        left: pipe.x,
        right: pipe.x + DEFAULT_SETTINGS.pipeWidth,
        top: 0,
        bottom: pipe.topHeight
      };

      const bottomPipeRect = {
        left: pipe.x,
        right: pipe.x + DEFAULT_SETTINGS.pipeWidth,
        top: pipe.topHeight + DEFAULT_SETTINGS.gapHeight,
        bottom: CANVAS_HEIGHT
      };

      const collide = (r1: any, r2: any) => {
        return !(r1.right < r2.left || 
                r1.left > r2.right || 
                r1.bottom < r2.top || 
                r1.top > r2.bottom);
      };

      if (collide(birdRect, topPipeRect) || collide(birdRect, bottomPipeRect)) {
        onGameOver(score);
      }

      if (!pipe.passed && pipe.x + DEFAULT_SETTINGS.pipeWidth < 50) {
        pipe.passed = true;
        setScore(prev => {
          const newScore = prev + 1;
          onScoreUpdate(newScore);
          return newScore;
        });
      }
    });

    if (birdY.current + BIRD_SIZE > CANVAS_HEIGHT - 20 || birdY.current < -100) {
      onGameOver(score);
    }

    frameCount.current++;
  }, [gameState, score, onGameOver, onScoreUpdate]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Sky
    const bgGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    bgGradient.addColorStop(0, '#fce4ec'); 
    bgGradient.addColorStop(1, '#f8bbd0'); 
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Pipes
    pipes.current.forEach(pipe => {
      ctx.fillStyle = '#f48fb1';
      ctx.strokeStyle = '#c2185b';
      ctx.lineWidth = 4;

      ctx.fillRect(pipe.x, 0, DEFAULT_SETTINGS.pipeWidth, pipe.topHeight);
      ctx.strokeRect(pipe.x, 0, DEFAULT_SETTINGS.pipeWidth, pipe.topHeight);

      ctx.fillRect(pipe.x, pipe.topHeight + DEFAULT_SETTINGS.gapHeight, DEFAULT_SETTINGS.pipeWidth, CANVAS_HEIGHT);
      ctx.strokeRect(pipe.x, pipe.topHeight + DEFAULT_SETTINGS.gapHeight, DEFAULT_SETTINGS.pipeWidth, CANVAS_HEIGHT);

      if (obstacleImg.current) {
        const faceX = pipe.x + (DEFAULT_SETTINGS.pipeWidth - OBSTACLE_FACE_SIZE) / 2;
        ctx.drawImage(obstacleImg.current, faceX, pipe.topHeight - OBSTACLE_FACE_SIZE - 10, OBSTACLE_FACE_SIZE, OBSTACLE_FACE_SIZE);
        ctx.drawImage(obstacleImg.current, faceX, pipe.topHeight + DEFAULT_SETTINGS.gapHeight + 10, OBSTACLE_FACE_SIZE, OBSTACLE_FACE_SIZE);
      }
    });

    // Bird
    ctx.save();
    ctx.translate(50 + BIRD_SIZE / 2, birdY.current + BIRD_SIZE / 2);
    const rotation = Math.min(Math.PI / 6, Math.max(-Math.PI / 6, birdVelocity.current * 0.08));
    ctx.rotate(rotation);
    
    if (birdImg.current) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = "white";
      ctx.drawImage(birdImg.current, -BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
    } else {
      ctx.fillStyle = '#ff4081';
      ctx.fillRect(-BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
    }
    ctx.restore();

    // Floor
    ctx.fillStyle = '#f06292';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
    ctx.strokeStyle = '#ad1457';
    ctx.strokeRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);
  }, []);

  const loop = useCallback((time: number) => {
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    update(deltaTime > 100 ? 16 : deltaTime); 
    draw();
    requestRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  useEffect(() => {
    if (gameState === GameState.START) {
      resetGame();
      draw();
    } else if (gameState === GameState.PLAYING) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(loop);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, loop, resetGame, draw]);

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl border-[8px] sm:border-[12px] border-white/60">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        onClick={jump}
        className="block bg-sky-100 cursor-pointer touch-none w-[88vw] max-w-[400px] h-[60vh] max-h-[600px] object-contain"
      />
    </div>
  );
};

export default FlappyGame;
