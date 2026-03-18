'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import Link from 'next/link';
import { ArrowRight, Plus, Trash2, History, Coins, Package, Settings as SettingsIcon, Check, Shield } from 'lucide-react';

export default function ParentDashboard() {
  const { coins, rewards, purchases, settings, password, childName, dailyProgress, addReward, updateReward, deleteReward, updateSettings, togglePurchaseStatus, setPassword, setChildName, addCoins, removeCoins } = useGame();
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);

  // Manual coin adjustment state
  const [coinAdjustmentAmount, setCoinAdjustmentAmount] = useState<string>('');

  // Local settings state
  const [localSettings, setLocalSettings] = useState(settings);
  const [localChildName, setLocalChildName] = useState(childName || '');

  // Password update state
  const [newPassword, setNewPassword] = useState('');
  const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === password) {
      setIsAuthenticated(true);
      setError('');
      setLocalSettings(settings); // Sync with context on login
      setLocalChildName(childName || '');
    } else {
      setError('סיסמה שגויה! נסו שוב');
      setPasswordInput('');
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length === 4 && /^\d+$/.test(newPassword)) {
      setPassword(newPassword);
      setNewPassword('');
      setPasswordUpdateMessage('הסיסמה עודכנה בהצלחה!');
      setTimeout(() => setPasswordUpdateMessage(''), 3000);
    } else {
      setPasswordUpdateMessage('הסיסמה חייבת להכיל 4 ספרות');
    }
  };

  const handleSaveSettings = () => {
    if (localSettings.operators.length === 0) {
      alert('חובה לבחור לפחות פעולת חשבון אחת!');
      return;
    }
    if (!localChildName.trim()) {
      alert('חובה להזין את שם הילד/ה!');
      return;
    }
    updateSettings(localSettings);
    setChildName(localChildName.trim());
    alert('ההגדרות נשמרו בהצלחה!');
  };

  const toggleOperator = (op: '+' | '-' | '*' | '/') => {
    setLocalSettings(prev => ({
      ...prev,
      operators: prev.operators.includes(op)
        ? prev.operators.filter(o => o !== op)
        : [...prev.operators, op]
    }));
  };

  const handleRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPrice && newIcon) {
      if (editingRewardId) {
        updateReward(editingRewardId, { name: newName, price: Number(newPrice), icon: newIcon });
        setEditingRewardId(null);
      } else {
        addReward({ name: newName, price: Number(newPrice), icon: newIcon });
      }
      setNewName('');
      setNewPrice('');
      setNewIcon('');
    }
  };

  const startEditing = (reward: any) => {
    setEditingRewardId(reward.id);
    setNewName(reward.name);
    setNewPrice(reward.price.toString());
    setNewIcon(reward.icon);
  };

  const handleCoinAdjustment = (type: 'add' | 'remove') => {
    const amount = Number(coinAdjustmentAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('נא להזין סכום תקין');
      return;
    }
    if (type === 'add') {
      addCoins(amount);
    } else {
      removeCoins(amount);
    }
    setCoinAdjustmentAmount('');
  };

  // Prepare graph data
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric' });
      days.push({ date: dateStr, label, count: dailyProgress[dateStr] || 0 });
    }
    return days;
  };

  const graphData = getLast7Days();
  const maxCount = Math.max(...graphData.map(d => d.count), 5); // Ensure at least a height of 5 for scale

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-purple-50 flex items-center justify-center p-4 font-varela" dir="rtl">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-[2rem] shadow-2xl border-4 border-purple-200 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-purple-600 mb-6 font-bubblegum">אזור הורים</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="____"
                className="w-full p-4 rounded-xl border-4 border-purple-200 focus:border-purple-500 outline-none text-center text-3xl font-black font-bubblegum tracking-[0.5rem] placeholder:text-gray-500 text-black"
                autoFocus
              />
              {error && <p className="text-red-600 mt-2 font-black">{error}</p>}
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 text-xl"
            >
              כניסה לדאשבורד
            </button>
            <Link href="/" className="text-purple-900 hover:text-black font-black underline underline-offset-4">חזרה למשחק</Link>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-50 p-4 md:p-8 font-varela" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-xl border-4 border-purple-300">
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.div whileHover={{ x: 5 }} className="bg-purple-100 p-3 rounded-full text-purple-700 border-2 border-purple-200">
                <ArrowRight size={24} />
              </motion.div>
            </Link>
            <h1 className="text-3xl font-black text-purple-900 font-bubblegum">ניהול הורים</h1>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 px-6 py-2 rounded-full border-2 border-yellow-500">
            <Coins className="text-yellow-700" />
            <span className="text-xl font-black text-yellow-900">{coins} מטבעות</span>
          </div>
        </header>

        {/* Progress Tracker Section */}
        <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-blue-200 mb-8">
          <div className="flex items-center gap-2 mb-8 text-blue-800">
            <History size={28} />
            <h2 className="text-2xl font-black">ביצועים בשבוע האחרון</h2>
          </div>
          
          <div className="flex items-end justify-between gap-2 h-48 px-2 md:px-8">
            {graphData.map((day) => (
              <div key={day.date} className="flex flex-col items-center flex-1 gap-2 group">
                <div className="relative w-full flex flex-col items-center">
                  {/* Tooltip or count on top */}
                  <div className="text-sm font-black text-blue-800 mb-1">
                    {day.count > 0 ? day.count : ''}
                  </div>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.count / maxCount) * 100}%` }}
                    className="w-8 md:w-12 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-xl min-h-[4px] shadow-[0_4px_0_#1d4ed8]"
                  />
                </div>
                <span className="text-[10px] md:text-xs font-black text-gray-900 text-center leading-tight h-8 flex items-center">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Right Column: Settings and History */}
          <div className="flex flex-col gap-6">
            {/* Settings Section */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-yellow-300">
              <div className="flex items-center gap-2 mb-6 text-yellow-800">
                <SettingsIcon size={28} />
                <h2 className="text-2xl font-black">הגדרות המשחק</h2>
              </div>
              
              <div className="space-y-6">
              {/* Child's Name */}
              <div>
                <label className="block text-black font-black mb-3">שם הילד/ה:</label>
                <input
                  type="text"
                  value={localChildName}
                  onChange={(e) => setLocalChildName(e.target.value)}
                  placeholder="שם הילדה"
                  className="w-full p-4 rounded-xl border-2 border-yellow-200 focus:border-yellow-500 outline-none font-black text-black placeholder:text-gray-500"
                />
              </div>

              {/* Operators */}
                <div>
                  <label className="block text-black font-black mb-3">פעולות חשבון:</label>
                  <div className="flex gap-4">
                  {(['+', '-', '*', '/'] as const).map(op => (
                    <button
                      key={op}
                      onClick={() => toggleOperator(op)}
                      className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 text-2xl font-black ${
                        localSettings.operators.includes(op)
                          ? 'bg-yellow-100 border-yellow-500 text-yellow-900 shadow-inner'
                          : 'bg-gray-100 border-gray-300 text-gray-700'
                      }`}
                    >
                      {op === '*' ? '×' : op === '/' ? '÷' : op}
                      {localSettings.operators.includes(op) && <Check size={20} />}
                    </button>
                  ))}
                </div>
                </div>

                {/* Number Range */}
                <div>
                  <label className="block text-black font-black mb-3">טווח מספרים:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-900 font-black block mb-1">מינימום</span>
                      <input
                        type="number"
                        value={localSettings.minNumber}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, minNumber: Number(e.target.value) }))}
                        className="w-full p-4 rounded-xl border-2 border-yellow-200 focus:border-yellow-500 outline-none text-center font-black text-black"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-900 font-black block mb-1">מקסימום</span>
                      <input
                        type="number"
                        value={localSettings.maxNumber}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, maxNumber: Number(e.target.value) }))}
                        className="w-full p-4 rounded-xl border-2 border-yellow-200 focus:border-yellow-500 outline-none text-center font-black text-black"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-xl"
                >
                  שמור הגדרות
                </button>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-gray-200">
              <div className="flex items-center gap-2 mb-6 text-gray-900">
                <Shield size={28} />
                <h2 className="text-2xl font-black">אבטחה</h2>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-black font-black mb-2">שינוי קוד סודי:</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="קוד חדש (4 ספרות)"
                    className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-gray-500 outline-none text-center text-2xl font-bubblegum tracking-[0.5rem] font-black placeholder:text-gray-500 text-black"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-xl"
                >
                  עדכן קוד
                </button>
                {passwordUpdateMessage && (
                  <p className={`text-center font-black ${passwordUpdateMessage.includes('בהצלחה') ? 'text-green-600' : 'text-red-600'}`}>
                    {passwordUpdateMessage}
                  </p>
                )}
              </form>
            </section>

            {/* Manual Coin Adjustment Section */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-yellow-300 mt-6">
              <div className="flex items-center justify-between mb-6 text-yellow-900">
                <div className="flex items-center gap-2">
                  <Coins size={28} />
                  <h2 className="text-2xl font-black">עדכון מטבעות ידני</h2>
                </div>
                <div className="bg-yellow-100 px-4 py-2 rounded-2xl border-2 border-yellow-500 text-center">
                  <div className="text-xs font-black text-yellow-800">יתרה נוכחית:</div>
                  <div className="text-2xl font-black text-yellow-900">💰 {coins}</div>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <input
                  type="number"
                  placeholder="כמות מטבעות"
                  value={coinAdjustmentAmount}
                  onChange={(e) => setCoinAdjustmentAmount(e.target.value)}
                  className="p-4 rounded-xl border-2 border-yellow-200 focus:border-yellow-500 outline-none text-center font-black text-xl text-black placeholder:text-gray-500"
                />
                <div className="flex gap-4">
                  <button
                    onClick={() => handleCoinAdjustment('add')}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-xl"
                  >
                    + הוסף
                  </button>
                  <button
                    onClick={() => handleCoinAdjustment('remove')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 text-xl"
                  >
                    - הפחת
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Left Column: Rewards Management */}
          <div className="flex flex-col gap-6">
            {/* Add Reward Form */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-pink-200">
              <div className="flex items-center gap-2 mb-6 text-pink-700">
                <Plus size={28} />
                <h2 className="text-2xl font-black">
                  {editingRewardId ? 'עריכת פרס' : 'הוספת פרס חדש'}
                </h2>
              </div>
              <form onSubmit={handleRewardSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="שם הפרס"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="p-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none font-bold text-black placeholder:text-gray-500"
                    required
                  />
                  <input
                    type="number"
                    placeholder="מחיר"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="p-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none font-bold text-black placeholder:text-gray-500"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="אייקון (אמוג'י)"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="p-4 rounded-xl border-2 border-purple-200 focus:border-purple-500 outline-none text-2xl text-center font-bold text-black placeholder:text-gray-500"
                  required
                />
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className={`flex-1 ${editingRewardId ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'} text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2`}
                  >
                    {editingRewardId ? <Check /> : <Plus />} 
                    {editingRewardId ? 'עדכן פרס' : 'הוסף לחנות'}
                  </button>
                  {editingRewardId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingRewardId(null);
                        setNewName('');
                        setNewPrice('');
                        setNewIcon('');
                      }}
                      className="px-6 bg-gray-300 hover:bg-gray-400 text-gray-900 font-black py-4 rounded-xl transition-all active:scale-95"
                    >
                      ביטול
                    </button>
                  )}
                </div>
              </form>
            </section>

            {/* Current Rewards List */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-purple-200">
              <div className="flex items-center gap-2 mb-6 text-purple-800">
                <Package size={28} />
                <h2 className="text-2xl font-black">פרסים בחנות</h2>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-purple-200">
                {rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 shadow-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{reward.icon}</span>
                      <div>
                        <div className="font-black text-purple-900">{reward.name}</div>
                        <div className="text-sm text-purple-800 font-bold">{reward.price} מטבעות</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => startEditing(reward)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors border-2 border-blue-200"
                        title="ערוך"
                      >
                        <SettingsIcon size={20} />
                      </button>
                      <button 
                        onClick={() => deleteReward(reward.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors border-2 border-red-200"
                        title="מחק"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Purchase History */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-blue-200">
              <div className="flex items-center gap-2 mb-6 text-blue-800">
                <History size={28} />
                <h2 className="text-2xl font-black">היסטוריית קניות</h2>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-blue-200">
                {purchases.length === 0 ? (
                  <div className="text-center py-10 text-gray-900 italic font-black">טרם בוצעו קניות...</div>
                ) : (
                  purchases.slice().reverse().map((purchase) => (
                    <div 
                      key={purchase.id} 
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between shadow-sm ${
                        purchase.status === 'done' 
                          ? 'bg-gray-100 border-gray-300 opacity-80' 
                          : 'bg-blue-50 border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{purchase.rewardIcon}</span>
                        <div>
                          <div className={`font-black ${purchase.status === 'done' ? 'text-gray-900' : 'text-blue-900'}`}>
                            {purchase.rewardName}
                          </div>
                          <div className="text-sm text-blue-900 font-bold">
                            {new Date(purchase.timestamp).toLocaleString('he-IL')}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => togglePurchaseStatus(purchase.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black transition-all border-2 ${
                          purchase.status === 'done'
                            ? 'bg-green-100 text-green-700 border-green-400'
                            : 'bg-yellow-100 text-yellow-800 border-yellow-400 hover:bg-yellow-200'
                        }`}
                      >
                        {purchase.status === 'done' ? (
                          <><Check size={18} /> בוצע</>
                        ) : (
                          'ממתין'
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
