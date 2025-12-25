
import React, { useState, useEffect } from 'react';
import { GameState } from './types';
import FlappyGame from './components/FlappyGame';
import { getGameOverMessage } from './services/geminiService';

// Image constants
const CASSIE_HEADSHOT = "https://images.squarespace-cdn.com/content/v1/58f05e94b8a79bb955e81d13/88c603bc-e380-4da4-862d-a2f0120173e6/headshot.png?format=500w"; 
const CASSIE_GRADUATE = "https://images.squarespace-cdn.com/content/v1/58f05e94b8a79bb955e81d13/050d5351-4091-494b-944a-d68a9c370211/graduate.png?format=750w"; 
const DOG_OBSTACLE = "https://images.squarespace-cdn.com/content/v1/58f05e94b8a79bb955e81d13/c3182855-f748-472d-9653-f726715f33f6/doghat.png?format=750w"; 

const GRADUATION_THRESHOLD = 5;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [aiMessage, setAiMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showGraduationEffect, setShowGraduationEffect] = useState(false);

  // Logic: Start as Headshot, switch to Graduate photo after 5 points
  const isGraduated = score >= GRADUATION_THRESHOLD;
  const birdImage = isGraduated ? CASSIE_GRADUATE : CASSIE_HEADSHOT;

  useEffect(() => {
    if (score === GRADUATION_THRESHOLD && gameState === GameState.PLAYING) {
      setShowGraduationEffect(true);
      const timer = setTimeout(() => setShowGraduationEffect(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [score, gameState]);

  const handleStart = () => {
    setGameState(GameState.PLAYING);
    setAiMessage("");
    setScore(0);
  };

  const handleGameOver = async (finalScore: number) => {
    setGameState(GameState.GAME_OVER);
    setScore(finalScore);
    if (finalScore > highScore) setHighScore(finalScore);
    
    setIsLoading(true);
    const msg = await getGameOverMessage(finalScore);
    setAiMessage(msg);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-100 via-rose-200 to-fuchsia-300 flex flex-col items-center justify-center p-2 sm:p-4 font-fun text-slate-900 overflow-hidden touch-none">
      
      {/* Background Decor */}
      <div className="fixed top-10 left-5 text-white/20 text-[100px] sm:text-[200px] select-none pointer-events-none animate-pulse">
        <i className="fa-solid fa-heart"></i>
      </div>
      <div className="fixed bottom-10 right-5 text-white/20 text-[80px] sm:text-[150px] select-none pointer-events-none animate-bounce" style={{animationDuration: '6s'}}>
        <i className="fa-solid fa-star"></i>
      </div>

      <main className="z-10 flex flex-col lg:flex-row items-center gap-4 lg:gap-12 max-w-6xl w-full">
        
        {/* Branding */}
        <div className="flex-1 space-y-4 lg:space-y-8 w-full max-w-md text-center lg:text-left">
          <div>
            <h1 className="text-5xl sm:text-7xl font-black text-rose-500 italic tracking-tighter drop-shadow-[0_4px_0_#fff] mb-1 uppercase">
              FLAPPY <span className="text-fuchsia-600 block sm:inline">CASSIE</span>
            </h1>
            <p className="text-rose-700/80 font-semibold text-lg sm:text-xl">Help Cassie get her degree! 💖🎓</p>
          </div>

          <div className="hidden sm:block bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/60 shadow-xl text-rose-900">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <i className="fa-solid fa-graduation-cap text-rose-500"></i>
              Graduation Goal
            </h3>
            <p className="text-sm leading-relaxed opacity-90">
              Survive {GRADUATION_THRESHOLD} dogs to see Cassie graduate mid-air! Reach your highest potential.
            </p>
          </div>
        </div>

        {/* Game Area */}
        <div className="relative group shrink-0">
          <FlappyGame 
            gameState={gameState} 
            onGameOver={handleGameOver}
            onScoreUpdate={setScore}
            birdImageUrl={birdImage}
            obstacleImageUrl={DOG_OBSTACLE}
          />

          {/* Graduation Flash Effect */}
          {showGraduationEffect && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-white/30 backdrop-blur-[2px] z-20 rounded-[2.5rem]">
               <div className="text-8xl animate-bounce drop-shadow-lg">🎓✨</div>
               <div className="font-pixel text-3xl text-white drop-shadow-[0_4px_0_#db2777]">CLASS OF 2024!</div>
            </div>
          )}

          {/* Overlays */}
          {gameState === GameState.START && (
            <div className="absolute inset-0 bg-rose-900/40 backdrop-blur-[4px] rounded-[2.5rem] flex flex-col items-center justify-center text-white p-8 z-30">
              <div className="animate-bounce mb-8">
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-4 border-rose-400 p-1">
                  <img src={CASSIE_HEADSHOT} alt="Cassie" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
              <button 
                onClick={handleStart}
                className="group relative px-12 py-5 bg-rose-500 hover:bg-rose-400 text-white rounded-full font-pixel text-lg shadow-[0_8px_0_#9d174d] active:shadow-none active:translate-y-1 transition-all"
              >
                GO CASSIE!
              </button>
              <p className="mt-8 text-sm font-pixel opacity-70 animate-pulse uppercase">Tap to Fly</p>
            </div>
          )}

          {gameState === GameState.GAME_OVER && (
            <div className="absolute inset-0 bg-rose-600/70 backdrop-blur-md rounded-[2.5rem] flex flex-col items-center justify-center text-white p-4 sm:p-6 text-center z-30">
              <h2 className="font-pixel text-3xl sm:text-5xl mb-4 animate-pulse drop-shadow-lg">BOOP! 🐾</h2>
              
              <div className="bg-white text-rose-900 p-6 sm:p-10 rounded-[40px] shadow-2xl mb-4 sm:mb-8 w-full max-w-[280px] transform -rotate-2">
                <div className="text-[10px] font-black text-rose-300 mb-1 uppercase tracking-[0.2em]">Score</div>
                <div className="text-5xl font-pixel mb-6 text-rose-600 leading-none">{score}</div>
                <div className="h-0.5 bg-rose-50 w-full mb-6"></div>
                <div className="text-[10px] font-black text-rose-300 mb-1 uppercase tracking-[0.2em]">Best Grade</div>
                <div className="text-3xl font-pixel text-fuchsia-500 leading-none">{highScore}</div>
              </div>

              {aiMessage && (
                <div className="mb-6 sm:mb-8 px-6 py-4 bg-white/20 backdrop-blur-lg rounded-3xl italic text-white text-sm sm:text-base max-w-[320px] border border-white/30 shadow-lg">
                  &ldquo;{aiMessage}&rdquo;
                </div>
              )}

              <button 
                onClick={() => setGameState(GameState.START)}
                className="px-10 py-4 bg-white text-rose-600 rounded-full font-pixel text-xs hover:bg-rose-50 active:scale-95 transition-all shadow-xl"
              >
                PLAY AGAIN 🎀
              </button>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="hidden lg:flex flex-col gap-6 w-72 h-full justify-center">
           <div className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/40 shadow-lg text-rose-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-fuchsia-500 rounded-2xl flex items-center justify-center text-white shadow-lg rotate-3">
                  <i className="fa-solid fa-crown text-2xl"></i>
                </div>
                <div>
                  <div className="text-[10px] opacity-60 uppercase font-black tracking-widest">High Score</div>
                  <div className="text-3xl font-pixel text-rose-600">{highScore}</div>
                </div>
              </div>
           </div>

           <div className="bg-fuchsia-600/10 backdrop-blur-sm rounded-3xl p-6 text-rose-900/80 text-sm border border-fuchsia-200">
              <div className="flex items-center gap-2 mb-4 font-black text-fuchsia-600 uppercase italic">
                <i className="fa-solid fa-sparkles"></i>
                Review
              </div>
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="animate-spin h-5 w-5 border-3 border-rose-300 border-t-rose-600 rounded-full"></div>
                  <span className="font-bold">Analyzing flight...</span>
                </div>
              ) : (
                <p className="font-medium leading-relaxed bg-white/20 p-4 rounded-2xl border border-white/20 shadow-inner">
                  {aiMessage || "The dog is waiting for a playmate! Can you reach score 5? 🐶🎓"}
                </p>
              )}
           </div>
        </div>
      </main>

      <footer className="mt-8 lg:mt-12 text-rose-500/60 text-[10px] sm:text-xs font-bold flex items-center gap-2 uppercase tracking-[0.3em]">
        <span>Made with Love</span>
        <i className="fa-solid fa-heart text-rose-500 animate-ping"></i>
        <span>for Cassie</span>
      </footer>
    </div>
  );
};

export default App;
