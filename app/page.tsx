'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Sparkles, Settings, Lock, Heart, Flame, Gift, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import confetti from 'canvas-confetti';

interface Exercise {
  a: number;
  b: number;
  operator: '+' | '-';
  result: number;
}

const DAILY_GOAL = 15;

const BubbleBlock = ({ children, color = 'purple', delay = 0, id, shake }: { children: React.ReactNode, color?: 'pink' | 'purple' | 'yellow' | 'blue', delay?: number, id?: string, shake?: boolean }) => {
  const colorClasses = {
    pink: 'bg-pink-100 border-pink-300 text-pink-500 bubble-shadow-pink',
    purple: 'bg-purple-100 border-purple-300 text-purple-500 bubble-shadow-purple',
    yellow: 'bg-yellow-100 border-yellow-300 text-yellow-500 bubble-shadow-yellow',
    blue: 'bg-blue-100 border-blue-300 text-blue-500 bubble-shadow-blue',
  };

  return (
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      animate={shake ? { 
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      } : { scale: 1, rotate: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay 
      }}
      id={id}
      className={`relative inline-flex items-center justify-center min-w-[60px] h-[60px] sm:min-w-[80px] sm:h-[80px] md:min-w-[120px] md:h-[120px] lg:min-w-[140px] lg:h-[140px] rounded-[1rem] sm:rounded-[1.5rem] md:rounded-[2rem] border-2 md:border-4 ${colorClasses[color as keyof typeof colorClasses]} text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bubblegum mx-0.5 sm:mx-1 md:mx-2 my-2 sm:my-4`}
    >
      <div className="relative z-10">
        {children}
      </div>
      {/* Decorative Sparkles */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5] 
        }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-yellow-400"
      >
        <Sparkles className="w-4 h-4 sm:w-6 sm:h-6" />
      </motion.div>
    </motion.div>
  );
};

export default function MathGame() {
  const { coins, rewards, purchases, settings, hearts, addCoins, removeCoins, makePurchase, setHearts } = useGame();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'gameover', message: string } | null>(null);
  const [key, setKey] = useState(0); // For resetting animations
  const [showModal, setShowModal] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<{ id: number, start: { x: number, y: number }, amount: number }[]>([]);
  
  // Gamification states
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [solvedToday, setSolvedToday] = useState(0);
  const [shakeExercise, setShakeExercise] = useState(false);

  const coinCounterRef = useRef<HTMLDivElement>(null);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const buyAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);
  const gameoverAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    successAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'); // Ding
    buyAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3'); // Bloop
    failAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'); // Buzz
    gameoverAudio.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2020/2020-preview.mp3'); // Sad Trombone
  }, []);

  const triggerConfetti = (type: 'success' | 'bonus' = 'success') => {
    if (type === 'bonus') {
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f472b6', '#a855f7']
      });
    } else {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f472b6', '#a855f7', '#fbbf24', '#34d399']
      });
    }
  };

  const generateExercise = useCallback(() => {
    const { operators, minNumber, maxNumber } = settings;
    const operator = operators.length > 0 
      ? operators[Math.floor(Math.random() * operators.length)] 
      : '+';

    let a, b, result;

    if (operator === '+') {
      // a + b = result
      // Ensure result <= maxNumber
      const range = maxNumber - minNumber;
      a = Math.floor(Math.random() * (range + 1)) + minNumber;
      b = Math.floor(Math.random() * (maxNumber - a + 1));
      result = a + b;
    } else {
      // Subtraction: a - b = result
      // Ensure a <= maxNumber and result >= minNumber
      a = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      b = Math.floor(Math.random() * (a - minNumber + 1));
      result = a - b;
    }

    const newExercise = { a, b, operator, result };
    
    // Generate 3 unique options within the general range
    const offset1 = Math.random() > 0.5 ? 10 : -10;
    const offset2 = Math.random() > 0.5 ? 2 : -2;
    
    const wrong1 = Math.max(minNumber, Math.min(maxNumber, result + offset1 + Math.floor(Math.random() * 5)));
    const wrong2 = Math.max(minNumber, Math.min(maxNumber, result + offset2 + Math.floor(Math.random() * 3)));
    
    const allOptions = Array.from(new Set([result, wrong1, wrong2]));
    while (allOptions.length < 3) {
      const randomOption = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      if (!allOptions.includes(randomOption)) {
        allOptions.push(randomOption);
      }
    }
    
    setOptions(allOptions.sort(() => Math.random() - 0.5));
    setCurrentExercise(newExercise as Exercise);
    setFeedback(null);
    setKey(prev => prev + 1);
  }, [settings]);

  useEffect(() => {
    generateExercise();
  }, [generateExercise]);

  const handleAnswer = (selected: number) => {
    if (!currentExercise || feedback?.type === 'gameover') return;

    if (selected === currentExercise.result) {
      const isStreak = streak >= 4;
      const coinAmount = isStreak ? 10 : 5;
      
      addCoins(coinAmount);
      setStreak(prev => prev + 1);
      setSolvedToday(prev => prev + 1);
      
      // Combo logic
      const nextCombo = combo + 1;
      if (nextCombo >= 5) {
        setCombo(0);
        addCoins(20); // Mystery box bonus
        triggerConfetti('bonus');
        setFeedback({ type: 'success', message: 'בונוס תיבת הפתעה! 🎁' });
      } else {
        setCombo(nextCombo);
        setFeedback({ type: 'success', message: isStreak ? 'WOW! 🔥 בונוס כפול!' : 'כל הכבוד! צדקת!' });
        triggerConfetti('success');
      }
      
      // Play Ding
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play().catch(() => {});
      }

      // Coin animation
      const resultBox = document.getElementById('result-box');
      if (resultBox) {
        const rect = resultBox.getBoundingClientRect();
        setFlyingCoins(prev => [...prev, { 
          id: Date.now(), 
          start: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
          amount: coinAmount
        }]);
      }

      setTimeout(generateExercise, 2000);
    } else {
      // Wrong Answer logic
      setStreak(0);
      setCombo(0);
      setShakeExercise(true);
      setTimeout(() => setShakeExercise(false), 500);

      const nextHearts = hearts - 1;
      if (nextHearts <= 0) {
        setHearts(0);
        removeCoins(5);
        setFeedback({ type: 'gameover', message: 'נגמרו הלבבות! 5 מטבעות הופחתו...' });
        
        if (gameoverAudio.current) {
          gameoverAudio.current.play().catch(() => {});
        }

        setTimeout(() => {
          setHearts(3);
          generateExercise();
        }, 2500);
      } else {
        setHearts(nextHearts);
        setFeedback({ type: 'error', message: 'אופס! נסי שוב...' });
        
        if (failAudio.current) {
          failAudio.current.currentTime = 0;
          failAudio.current.play().catch(() => {});
        }
      }
    }
  };

  const buyReward = (reward: any) => {
    if (coins >= reward.price) {
      makePurchase(reward);
      setShowModal(true);
      
      // Play Bloop
      if (buyAudio.current) {
        buyAudio.current.currentTime = 0;
        buyAudio.current.play().catch(() => {});
      }
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-8 font-varela" dir="rtl">
      {/* Flying Coins */}
      <AnimatePresence>
        {flyingCoins.map((coin) => (
          <motion.div
            key={coin.id}
            initial={{ x: coin.start.x, y: coin.start.y, opacity: 1, scale: 1 }}
            animate={{ 
              x: coinCounterRef.current?.getBoundingClientRect().left ?? 0, 
              y: coinCounterRef.current?.getBoundingClientRect().top ?? 0,
              opacity: 0,
              scale: 0.5
            }}
            transition={{ duration: 1, ease: "easeIn" }}
            onAnimationComplete={() => setFlyingCoins(prev => prev.filter(c => c.id !== coin.id))}
            className="fixed z-[100] text-3xl pointer-events-none"
          >
            💰 <span className="text-yellow-600 font-bold">+{coin.amount}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] p-10 shadow-2xl border-8 border-pink-200 flex flex-col items-center gap-6 max-w-sm w-full text-center"
            >
              <div className="text-8xl animate-bounce">✨🎁✨</div>
              <h2 className="text-4xl font-black text-purple-600 font-bubblegum">כל הכבוד!</h2>
              <p className="text-2xl font-bold text-pink-500">ההודעה נשלחה להורים!</p>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowModal(false)}
                className="mt-4 bg-green-400 hover:bg-green-500 text-white text-2xl font-bold py-4 px-12 rounded-2xl shadow-[0_6px_0_#16a34a] active:translate-y-1 active:shadow-none transition-all"
              >
                איזה כיף!
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header with Hearts and Stats */}
      <header className="w-full max-w-4xl bg-white rounded-3xl shadow-lg p-6 flex flex-wrap justify-between items-center border-4 border-pink-200 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/">
            <h1 className="text-2xl md:text-3xl font-bold text-purple-600 font-bubblegum">משחק החשבון שלי</h1>
          </Link>
          
          {/* Hearts Display */}
          <div className="flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-full border-2 border-red-200">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ scale: i < hearts ? 1 : 0.5, opacity: i < hearts ? 1 : 0.3 }}
              >
                <Heart className={`w-6 h-6 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Streak Display */}
          <AnimatePresence>
            {streak >= 3 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-full border-2 border-orange-400"
              >
                <Flame className={`w-6 h-6 ${streak >= 5 ? 'text-orange-600 animate-pulse' : 'text-orange-500'}`} />
                <span className="font-bold text-orange-700">{streak}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Daily Goal Display */}
          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border-2 border-blue-200 group relative">
            <CheckCircle2 className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-blue-700">{solvedToday}/{DAILY_GOAL}</span>
            {/* Simple tooltip/hover info */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-blue-600 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              יעד יומי!
            </div>
          </div>

          <div ref={coinCounterRef} className="flex items-center gap-2 bg-yellow-100 px-4 py-1.5 rounded-full border-2 border-yellow-400">
            <span className="text-2xl">💰</span>
            <span className="text-2xl font-bold text-yellow-700">{coins}</span>
          </div>
          
          <Link href="/parent">
            <motion.div whileHover={{ rotate: 90 }} className="text-gray-300 hover:text-purple-400 transition-colors p-1">
              <Settings size={24} />
            </motion.div>
          </Link>
        </div>
      </header>

      {/* Combo Progress Bar */}
      <div className="w-full max-w-2xl px-4">
        <div className="flex justify-between items-center mb-1 px-2">
          <span className="text-sm font-bold text-purple-400">בונוס קומבו! 🎁</span>
          <span className="text-sm font-bold text-purple-400">{combo}/5</span>
        </div>
        <div className="h-4 bg-purple-100 rounded-full overflow-hidden border-2 border-purple-200">
          <motion.div 
            className="h-full bg-gradient-to-r from-pink-400 to-purple-500"
            initial={{ width: 0 }}
            animate={{ width: `${(combo / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Challenge Card */}
      <section className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-[3rem] shadow-2xl p-6 md:p-12 flex flex-col items-center gap-10 border-b-12 border-purple-200 relative overflow-hidden">
        {/* Background blobs for more playfulness */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-pink-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-purple-100 rounded-full translate-x-1/3 translate-y-1/3 opacity-50" />

        <div className="flex flex-row flex-nowrap justify-center items-center gap-1 sm:gap-2 md:gap-4 w-full" dir="ltr" key={key}>
          {currentExercise ? (
            <>
              {/* Number 1 box */}
              <BubbleBlock color="purple" delay={0.1} shake={shakeExercise}>{currentExercise.a}</BubbleBlock>
              
              {/* Operator box */}
              <BubbleBlock color="pink" delay={0.2} shake={shakeExercise}>{currentExercise.operator}</BubbleBlock>
              
              {/* Number 2 box */}
              <BubbleBlock color="purple" delay={0.3} shake={shakeExercise}>{currentExercise.b}</BubbleBlock>
              
              {/* Equals box */}
              <BubbleBlock color="pink" delay={0.4} shake={shakeExercise}>=</BubbleBlock>
              
              {/* Result box */}
              <BubbleBlock color="yellow" delay={0.5} id="result-box" shake={shakeExercise}>
                {feedback?.type === 'success' ? currentExercise.result : '?'}
              </BubbleBlock>
            </>
          ) : (
            <div className="text-3xl animate-pulse text-purple-400 font-bold">מכין תרגיל חדש...</div>
          )}
        </div>

        {/* Feedback Message */}
        <AnimatePresence mode="wait">
          {feedback && (
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.5 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.5 }}
              className={`text-2xl md:text-4xl font-bold text-center ${
                feedback.type === 'success' ? 'text-green-500' : 
                feedback.type === 'gameover' ? 'text-red-600 animate-bounce' : 'text-red-500'
              } drop-shadow-sm`}
            >
              {feedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Answer Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
          {options.map((option, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.1, rotate: idx % 2 === 0 ? 2 : -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleAnswer(option)}
              disabled={feedback?.type === 'success'}
              className={`text-5xl font-bubblegum py-8 rounded-3xl transition-colors border-b-8 bubble-shadow-pink ${
                feedback?.type === 'success' && option === currentExercise?.result
                  ? 'bg-green-100 text-green-600 border-green-300'
                  : 'bg-pink-100 hover:bg-pink-200 text-pink-600 border-pink-300'
              }`}
            >
              {option}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Reward Shop */}
      <section className="w-full max-w-5xl bg-white/50 backdrop-blur-sm rounded-[3rem] p-8 md:p-12 border-4 border-dashed border-purple-200">
        <h2 className="text-4xl font-bold text-purple-600 mb-8 text-center">חנות המתנות 🎁</h2>
        {rewards.length === 0 ? (
          <div className="text-center py-12 px-6">
            <div className="text-6xl mb-4">🧸✨</div>
            <p className="text-2xl font-bold text-purple-400">אמא ואבא עוד לא הוסיפו הפתעות, כדאי לבקש מהם!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {rewards.map((reward) => (
              <motion.div 
                key={reward.id}
                whileHover={{ y: -5 }}
                className={`bg-white p-6 rounded-[2rem] shadow-xl flex flex-col items-center gap-4 transition-all relative`}
              >
                <div className="text-6xl">{reward.icon}</div>
                <div className="font-bold text-gray-700 text-lg text-center">{reward.name}</div>
                <div className="flex items-center gap-1 text-yellow-600 font-bold text-xl">
                  <span>{reward.price}</span>
                  <span>💰</span>
                </div>
                <button
                  onClick={() => buyReward(reward)}
                  disabled={coins < reward.price}
                  className={`w-full py-3 rounded-2xl font-bold text-lg transition-all ${
                    coins >= reward.price
                      ? 'bg-green-400 hover:bg-green-500 text-white shadow-[0_4px_0_#16a34a] active:translate-y-1 active:shadow-none'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  קנייה
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Collection */}
      {purchases.length > 0 && (
        <section className="w-full max-w-4xl">
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold text-pink-500 mb-6 text-center"
          >
            האוסף המקסים שלי ✨
          </motion.h2>
          <div className="flex flex-wrap justify-center gap-6">
            <AnimatePresence>
              {purchases.map((purchase, index) => {
                return (
                  <motion.div 
                    key={purchase.id}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-5xl bg-white p-4 rounded-full shadow-lg border-4 border-pink-100 flex items-center justify-center w-20 h-20"
                  >
                    {purchase.rewardIcon}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Hidden Parent Link */}
      <div className="mt-auto pt-8 opacity-5 hover:opacity-100 transition-opacity">
        <Link href="/parent">
          <div className="p-4 cursor-pointer text-gray-400">
            <Lock size={16} />
          </div>
        </Link>
      </div>
    </main>
  );
}

