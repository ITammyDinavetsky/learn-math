'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Reward {
  id: string;
  name: string;
  price: number;
  icon: string;
}

export interface Purchase {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardIcon: string;
  timestamp: number;
  status: 'pending' | 'done';
}

export interface ParentSettings {
  operators: ('+' | '-' | '*' | '/')[];
  minNumber: number;
  maxNumber: number;
}

export type ThemeColor = 'white' | 'pink' | 'blue' | 'yellow';

export interface DailyProgress {
  [date: string]: number;
}

interface GameContextType {
  coins: number;
  rewards: Reward[];
  purchases: Purchase[];
  settings: ParentSettings;
  hearts: number;
  password: string | null;
  childName: string | null;
  themeColor: ThemeColor;
  dailyProgress: DailyProgress;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (id: string, reward: Omit<Reward, 'id'>) => void;
  deleteReward: (id: string) => void;
  makePurchase: (reward: Reward) => void;
  updateSettings: (settings: ParentSettings) => void;
  setHearts: (hearts: number) => void;
  togglePurchaseStatus: (id: string) => void;
  setPassword: (password: string) => void;
  setChildName: (name: string) => void;
  setThemeColor: (color: ThemeColor) => void;
  recordCorrectAnswer: () => void;
}

const DEFAULT_SETTINGS: ParentSettings = {
  operators: ['+'],
  minNumber: 1,
  maxNumber: 20,
};

const DEFAULT_REWARDS: Reward[] = [
  { id: '1', name: 'גלידה מתוקה', price: 10, icon: '🍦' },
  { id: '2', name: 'כדור פלא', price: 15, icon: '⚽' },
  { id: '3', name: 'דובי חמוד', price: 25, icon: '🧸' },
  { id: '4', name: 'סוכריה על מקל', price: 5, icon: '🍭' },
  { id: '5', name: 'קופסת הפתעה', price: 50, icon: '🎁' },
  { id: '6', name: 'חד קרן קסום', price: 100, icon: '🦄' },
];

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>(DEFAULT_REWARDS);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [settings, setSettings] = useState<ParentSettings>(DEFAULT_SETTINGS);
  const [hearts, setHeartsState] = useState(3);
  const [password, setPasswordState] = useState<string | null>(null);
  const [childName, setChildNameState] = useState<string | null>(null);
  const [themeColor, setThemeColorState] = useState<ThemeColor>('white');
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCoins = localStorage.getItem('math-game-coins');
    const savedRewards = localStorage.getItem('math-game-rewards');
    const savedPurchases = localStorage.getItem('math-game-purchases');
    const savedSettings = localStorage.getItem('math-game-settings');
    const savedHearts = localStorage.getItem('math-game-hearts');
    const savedPassword = localStorage.getItem('math-game-password');
    const savedChildName = localStorage.getItem('math-game-child-name');
    const savedTheme = localStorage.getItem('math-game-theme');
    const savedProgress = localStorage.getItem('math_progress');

    if (savedCoins) setCoins(Number(savedCoins));
    if (savedRewards) setRewards(JSON.parse(savedRewards));
    if (savedPurchases) setPurchases(JSON.parse(savedPurchases));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedHearts) setHeartsState(Number(savedHearts));
    if (savedPassword) setPasswordState(savedPassword);
    if (savedChildName) setChildNameState(savedChildName);
    if (savedTheme) setThemeColorState(savedTheme as ThemeColor);
    if (savedProgress) setDailyProgress(JSON.parse(savedProgress));
    
    setIsInitialized(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('math-game-coins', coins.toString());
      localStorage.setItem('math-game-rewards', JSON.stringify(rewards));
      localStorage.setItem('math-game-purchases', JSON.stringify(purchases));
      localStorage.setItem('math-game-settings', JSON.stringify(settings));
      localStorage.setItem('math-game-hearts', hearts.toString());
      localStorage.setItem('math-game-theme', themeColor);
      localStorage.setItem('math_progress', JSON.stringify(dailyProgress));
      if (password) localStorage.setItem('math-game-password', password);
      if (childName) localStorage.setItem('math-game-child-name', childName);
    }
  }, [coins, rewards, purchases, settings, hearts, password, childName, themeColor, dailyProgress, isInitialized]);

  const addCoins = (amount: number) => setCoins(prev => prev + amount);
  const removeCoins = (amount: number) => setCoins(prev => prev - amount);

  const addReward = (reward: Omit<Reward, 'id'>) => {
    const newReward = { ...reward, id: Date.now().toString() };
    setRewards(prev => [...prev, newReward]);
  };

  const updateReward = (id: string, updatedReward: Omit<Reward, 'id'>) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...updatedReward, id } : r));
  };

  const deleteReward = (id: string) => {
    setRewards(prev => prev.filter(r => r.id !== id));
  };

  const makePurchase = (reward: Reward) => {
    if (coins >= reward.price) {
      setCoins(prev => prev - reward.price);
      const newPurchase: Purchase = {
        id: Date.now().toString(),
        rewardId: reward.id,
        rewardName: reward.name,
        rewardIcon: reward.icon,
        timestamp: Date.now(),
        status: 'pending',
      };
      setPurchases(prev => [...prev, newPurchase]);
    }
  };

  const updateSettings = (newSettings: ParentSettings) => {
    setSettings(newSettings);
  };

  const setHearts = (newHearts: number) => {
    setHeartsState(newHearts);
  };

  const togglePurchaseStatus = (id: string) => {
    setPurchases(prev => prev.map(p => 
      p.id === id ? { ...p, status: p.status === 'pending' ? 'done' : 'pending' } : p
    ));
  };

  const setPassword = (newPassword: string) => {
    setPasswordState(newPassword);
  };

  const setChildName = (newName: string) => {
    setChildNameState(newName);
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
  };

  const recordCorrectAnswer = () => {
    const today = new Date().toISOString().split('T')[0];
    setDailyProgress(prev => ({
      ...prev,
      [today]: (prev[today] || 0) + 1
    }));
  };

  return (
    <GameContext.Provider value={{ 
      coins, 
      rewards, 
      purchases, 
      settings,
      hearts,
      password,
      childName,
      themeColor,
      dailyProgress,
      addCoins, 
      removeCoins, 
      addReward, 
      updateReward,
      deleteReward, 
      makePurchase,
      updateSettings,
      setHearts,
      togglePurchaseStatus,
      setPassword,
      setChildName,
      setThemeColor,
      recordCorrectAnswer
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
