'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Sparkles, Settings, Lock, Heart, Gift, CheckCircle2 } from 'lucide-react';
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
  const { coins, rewards, purchases, settings, hearts, password, childName, themeColor, addCoins, removeCoins, makePurchase, setHearts, setPassword, setChildName, setThemeColor, recordCorrectAnswer } = useGame();
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'gameover', message: string } | null>(null);
  const [key, setKey] = useState(0); // For resetting animations
  const [showModal, setShowModal] = useState(false);
  const [showComboCelebration, setShowComboCelebration] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<{ id: number, start: { x: number, y: number }, amount: number }[]>([]);

  const themeClasses = {
    white: 'bg-white',
    pink: 'bg-pink-50',
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
  };
  
  // Onboarding/Password Setup
  const [setupPassword, setSetupPassword] = useState('');
  const [setupName, setSetupName] = useState('');
  const [setupError, setSetupError] = useState('');

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
      const range = maxNumber - minNumber;
      a = Math.floor(Math.random() * (range + 1)) + minNumber;
      b = Math.floor(Math.random() * (maxNumber - a + 1));
      result = a + b;
    } else if (operator === '-') {
      a = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber;
      b = Math.floor(Math.random() * (a - minNumber + 1));
      result = a - b;
    } else if (operator === '*') {
      // Multiplication: result should be within a reasonable range for kids
      // Let's say max result is maxNumber
      const possibleResults = [];
      for (let i = 1; i <= maxNumber; i++) {
        for (let j = 1; j <= maxNumber; j++) {
          if (i * j <= maxNumber && i * j >= minNumber) {
            possibleResults.push({ a: i, b: j, res: i * j });
          }
        }
      }
      const choice = possibleResults.length > 0 
        ? possibleResults[Math.floor(Math.random() * possibleResults.length)]
        : { a: 2, b: 3, res: 6 };
      a = choice.a;
      b = choice.b;
      result = choice.res;
    } else {
      // Division: result must be integer, b != 0, a/b = res
      const possibleDivisions = [];
      for (let res = minNumber; res <= maxNumber; res++) {
        for (let divisor = 1; divisor <= 10; divisor++) {
          const dividend = res * divisor;
          if (dividend <= maxNumber * 2) { // Allow slightly larger dividends for variety
            possibleDivisions.push({ a: dividend, b: divisor, res });
          }
        }
      }
      const choice = possibleDivisions.length > 0 
        ? possibleDivisions[Math.floor(Math.random() * possibleDivisions.length)]
        : { a: 10, b: 2, res: 5 };
      a = choice.a;
      b = choice.b;
      result = choice.res;
    }

    const displayOperator = operator === '*' ? '×' : operator === '/' ? '÷' : operator;
    const newExercise = { a, b, operator: displayOperator as '+' | '-', result };
    
    // Generate 3 unique options within range
    const allOptions = new Set<number>([result]);
    while (allOptions.size < 3) {
      const offset = Math.floor(Math.random() * 10) - 5;
      const option = Math.max(0, result + (offset === 0 ? 1 : offset));
      allOptions.add(option);
    }
    
    setOptions(Array.from(allOptions).sort(() => Math.random() - 0.5));
    setCurrentExercise(newExercise as Exercise);
    setFeedback(null);
    setKey(prev => prev + 1);
  }, [settings]);

  useEffect(() => {
    if (password) {
      generateExercise();
    }
  }, [generateExercise, password]);

  const handleSetupPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupName.trim()) {
      setSetupError('אנא הקישו את שם הילדה');
      return;
    }
    if (setupPassword.length === 4 && /^\d+$/.test(setupPassword)) {
      setChildName(setupName.trim());
      setPassword(setupPassword);
      setSetupError('');
    } else {
      setSetupError('אנא הקישו 4 ספרות בדיוק');
    }
  };

  if (!password || !childName) {
    return (
      <main className="min-h-screen bg-purple-50 flex items-center justify-center p-4 font-varela" dir="rtl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-pink-200 max-w-md w-full text-center"
        >
          <div className="text-8xl mb-6">👋✨</div>
          <h1 className="text-4xl font-black text-purple-600 mb-4 font-bubblegum">ברוכים הבאים!</h1>
          <p className="text-xl text-purple-400 mb-8 font-bold">הורים, בואו נגדיר את החשבון שלכם:</p>
          <form onSubmit={handleSetupPassword} className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="text-right">
                <label className="block text-purple-600 font-bold mb-2 px-2">שם הילדה:</label>
                <input
                  type="text"
                  value={setupName}
                  onChange={(e) => setSetupName(e.target.value)}
                  placeholder="למשל: נועה"
                  className="w-full p-4 rounded-2xl border-4 border-purple-100 focus:border-purple-400 outline-none text-center text-2xl"
                />
              </div>
              <div className="text-right">
                <label className="block text-purple-600 font-bold mb-2 px-2">קוד סודי להורים (4 ספרות):</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={setupPassword}
                  onChange={(e) => setSetupPassword(e.target.value)}
                  placeholder="____"
                  className="w-full p-4 rounded-2xl border-4 border-purple-100 focus:border-purple-400 outline-none text-center text-3xl font-bubblegum tracking-[0.5rem]"
                />
              </div>
              {setupError && <p className="text-red-500 mt-2 font-bold">{setupError}</p>}
            </div>
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-5 rounded-2xl transition-all shadow-[0_8px_0_#7e22ce] active:translate-y-2 active:shadow-none text-2xl mt-4"
            >
              בואו נתחיל!
            </button>
          </form>
        </motion.div>
      </main>
    );
  }

  const handleAnswer = (selected: number) => {
    if (!currentExercise || feedback?.type === 'gameover' || showComboCelebration) return;

    if (selected === currentExercise.result) {
      const newStreak = streak + 1;
      const coinAmount = 5; // Base amount for correct answer
      
      addCoins(coinAmount);
      setStreak(newStreak);
      setSolvedToday(prev => prev + 1);
      recordCorrectAnswer();
      
      // Combo logic
      const nextCombo = combo + 1;
      if (nextCombo >= 5) {
        setCombo(0);
        setShowComboCelebration(true);
        triggerConfetti('bonus');
        
        if (successAudio.current) {
          successAudio.current.currentTime = 0;
          successAudio.current.play().catch(() => {});
        }

        setTimeout(() => {
          setShowComboCelebration(false);
          addCoins(15); // Combo Bonus (+15)
          setStreak(0);
          
          const startX = window.innerWidth / 2;
          const startY = window.innerHeight / 2;
          setFlyingCoins(prev => [...prev, { 
            id: Date.now(), 
            start: { x: startX, y: startY },
            amount: 15
          }]);
          
          generateExercise();
        }, 4000);
      } else {
        setCombo(nextCombo);
        setFeedback({ type: 'success', message: newStreak >= 5 ? 'WOW! 🔥 בונוס כפול!' : 'כל הכבוד! צדקת!' });
        triggerConfetti('success');
        
        if (successAudio.current) {
          successAudio.current.currentTime = 0;
          successAudio.current.play().catch(() => {});
        }

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
      }
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
    <main className={`min-h-screen p-4 md:p-8 flex flex-col items-center gap-8 font-varela transition-colors duration-500 ${themeClasses[themeColor]}`} dir="rtl">
      {/* Theme Picker Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.1, rotate: 10 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowThemeMenu(!showThemeMenu)}
          className="w-16 h-16 bg-white rounded-full shadow-lg border-4 border-pink-200 flex items-center justify-center text-3xl"
        >
          🎨
        </motion.button>
        <AnimatePresence>
          {showThemeMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0, y: 20 }}
              className="absolute bottom-20 right-0 bg-white p-4 rounded-3xl shadow-2xl border-4 border-pink-100 flex flex-col gap-4"
            >
              {[
                { id: 'white', color: 'bg-white', label: 'לבן קלאסי' },
                { id: 'pink', color: 'bg-pink-200', label: 'ורוד רך' },
                { id: 'blue', color: 'bg-blue-200', label: 'תכלת שמיים' },
                { id: 'yellow', color: 'bg-yellow-200', label: 'צהוב שמש' },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setThemeColor(theme.id as any);
                    setShowThemeMenu(false);
                  }}
                  className={`w-12 h-12 rounded-full border-4 transition-transform hover:scale-110 ${theme.color} ${themeColor === theme.id ? 'border-purple-400' : 'border-transparent'}`}
                  title={theme.label}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

      {/* Combo Celebration Overlay */}
      <AnimatePresence>
        {showComboCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="relative bg-white rounded-[4rem] p-12 shadow-2xl border-[12px] border-purple-200 flex flex-col items-center text-center gap-8 max-w-2xl mx-4"
            >
              {/* Treasure Chest & Star */}
              <div className="relative mb-4">
                <motion.div
                  animate={{ 
                    rotate: [0, -5, 5, -5, 5, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-9xl md:text-[12rem] leading-none"
                >
                  📦✨
                </motion.div>
                {/* Gold coins bursting out effect */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1.5 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="text-6xl">💰💰💰</div>
                </motion.div>
                {/* Happy Star Character */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-10 -right-10 text-7xl md:text-8xl"
                >
                  ⭐😊
                </motion.div>
              </div>

              <div className="space-y-4">
                <motion.h2 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-5xl md:text-7xl font-black text-purple-600 font-bubblegum drop-shadow-lg"
                >
                  +15 נקודות קומבו!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-2xl md:text-3xl font-bold text-pink-500"
                >
                  כל הכבוד על 5 תשובות נכונות ברציפות!
                </motion.p>
              </div>

              {/* Decorative side stars */}
              <div className="absolute top-10 left-10 text-yellow-400 animate-pulse">✨</div>
              <div className="absolute bottom-10 right-10 text-yellow-400 animate-pulse delay-75">✨</div>
            </motion.div>
          </motion.div>
        )}
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
      <header className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-xl p-6 flex flex-wrap justify-between items-center border-4 border-pink-200 gap-4 bubble-shadow">
        <div className="flex items-center gap-6">
          <Link href="/">
            <div className="flex items-center gap-3">
              <span className="text-4xl">👑</span>
              <h1 className="text-3xl md:text-4xl font-bold text-purple-600 font-bubblegum">
                <span className="text-pink-500">{childName}</span> האלופה!
              </h1>
            </div>
          </Link>
          
          {/* Hearts Display */}
          <div className="flex items-center gap-2 bg-red-50 px-5 py-2.5 rounded-full border-2 border-red-200">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{ scale: i < hearts ? 1.2 : 0.6, opacity: i < hearts ? 1 : 0.3 }}
              >
                <Heart className={`w-8 h-8 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Daily Goal Display */}
          <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-full border-2 border-blue-200 group relative">
            <CheckCircle2 className="w-8 h-8 text-blue-500" />
            <span className="font-bold text-2xl text-blue-700">{solvedToday}/{DAILY_GOAL}</span>
          </div>

          <div ref={coinCounterRef} className="flex items-center gap-3 bg-yellow-100 px-6 py-2.5 rounded-full border-2 border-yellow-400 bubble-shadow-yellow">
            <span className="text-4xl">💰</span>
            <span className="text-3xl font-bold text-yellow-700">{coins}</span>
          </div>
          
          <Link href="/parent">
            <motion.div whileHover={{ rotate: 90 }} className="text-gray-300 hover:text-purple-400 transition-colors p-2">
              <Settings size={32} />
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
      <section className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-[4rem] shadow-2xl p-6 md:p-12 flex flex-col items-center gap-10 border-b-[16px] border-purple-200 relative overflow-hidden bubble-shadow-purple">
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
              whileHover={{ scale: 0.98, y: 2 }}
              whileTap={{ scale: 0.95, y: 4 }}
              onClick={() => handleAnswer(option)}
              disabled={feedback?.type === 'success'}
              className={`text-5xl font-bubblegum py-8 rounded-[2.5rem] transition-all border-b-8 bubble-shadow-pink ${
                feedback?.type === 'success' && option === currentExercise?.result
                  ? 'bg-green-100 text-green-600 border-green-300'
                  : 'bg-pink-100 text-pink-600 border-pink-300'
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

