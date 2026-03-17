'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/context/GameContext';
import Link from 'next/link';
import { ArrowRight, Plus, Trash2, History, Coins, Package, Settings as SettingsIcon, Check, Shield } from 'lucide-react';

export default function ParentDashboard() {
  const { coins, rewards, purchases, settings, password, childName, addReward, deleteReward, updateSettings, togglePurchaseStatus, setPassword, setChildName } = useGame();
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newIcon, setNewIcon] = useState('');

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
      alert('חובה להזין את שם הילדה!');
      return;
    }
    updateSettings(localSettings);
    setChildName(localChildName.trim());
    alert('ההגדרות נשמרו בהצלחה!');
  };

  const toggleOperator = (op: '+' | '-') => {
    setLocalSettings(prev => ({
      ...prev,
      operators: prev.operators.includes(op)
        ? prev.operators.filter(o => o !== op)
        : [...prev.operators, op]
    }));
  };

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName && newPrice && newIcon) {
      addReward({
        name: newName,
        price: Number(newPrice),
        icon: newIcon,
      });
      setNewName('');
      setNewPrice('');
      setNewIcon('');
    }
  };

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
                className="w-full p-4 rounded-xl border-2 border-purple-100 focus:border-purple-400 outline-none text-center text-3xl font-bubblegum tracking-[0.5rem]"
                autoFocus
              />
              {error && <p className="text-red-500 mt-2 font-bold">{error}</p>}
            </div>
            <button
              type="submit"
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 text-xl"
            >
              כניסה לדאשבורד
            </button>
            <Link href="/" className="text-purple-400 hover:text-purple-600 font-bold">חזרה למשחק</Link>
          </form>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-50 p-4 md:p-8 font-varela" dir="rtl">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-lg border-4 border-purple-200">
          <div className="flex items-center gap-4">
            <Link href="/">
              <motion.div whileHover={{ x: 5 }} className="bg-purple-100 p-3 rounded-full text-purple-600">
                <ArrowRight size={24} />
              </motion.div>
            </Link>
            <h1 className="text-3xl font-bold text-purple-600 font-bubblegum">ניהול הורים</h1>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 px-6 py-2 rounded-full border-2 border-yellow-400">
            <Coins className="text-yellow-600" />
            <span className="text-xl font-bold text-yellow-700">{coins} מטבעות</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Right Column: Settings and History */}
          <div className="flex flex-col gap-6">
            {/* Settings Section */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-yellow-100">
              <div className="flex items-center gap-2 mb-6 text-yellow-600">
                <SettingsIcon size={28} />
                <h2 className="text-2xl font-bold">הגדרות המשחק</h2>
              </div>
              
              <div className="space-y-6">
              {/* Child's Name */}
              <div>
                <label className="block text-gray-700 font-bold mb-3">שם הילדה:</label>
                <input
                  type="text"
                  value={localChildName}
                  onChange={(e) => setLocalChildName(e.target.value)}
                  placeholder="שם הילדה"
                  className="w-full p-4 rounded-xl border-2 border-yellow-50 focus:border-yellow-300 outline-none font-bold"
                />
              </div>

              {/* Operators */}
                <div>
                  <label className="block text-gray-700 font-bold mb-3">פעולות חשבון:</label>
                  <div className="flex gap-4">
                    {(['+', '-'] as const).map(op => (
                      <button
                        key={op}
                        onClick={() => toggleOperator(op)}
                        className={`flex-1 py-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 text-2xl font-bold ${
                          localSettings.operators.includes(op)
                            ? 'bg-yellow-100 border-yellow-400 text-yellow-700 shadow-inner'
                            : 'bg-gray-50 border-gray-200 text-gray-400'
                        }`}
                      >
                        {op}
                        {localSettings.operators.includes(op) && <Check size={20} />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number Range */}
                <div>
                  <label className="block text-gray-700 font-bold mb-3">טווח מספרים:</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">מינימום</span>
                      <input
                        type="number"
                        value={localSettings.minNumber}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, minNumber: Number(e.target.value) }))}
                        className="w-full p-4 rounded-xl border-2 border-yellow-50 focus:border-yellow-300 outline-none text-center font-bold"
                      />
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block mb-1">מקסימום</span>
                      <input
                        type="number"
                        value={localSettings.maxNumber}
                        onChange={(e) => setLocalSettings(prev => ({ ...prev, maxNumber: Number(e.target.value) }))}
                        className="w-full p-4 rounded-xl border-2 border-yellow-50 focus:border-yellow-300 outline-none text-center font-bold"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-xl"
                >
                  שמור הגדרות
                </button>
              </div>
            </section>

            {/* Security Section */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-gray-100">
              <div className="flex items-center gap-2 mb-6 text-gray-600">
                <Shield size={28} />
                <h2 className="text-2xl font-bold">אבטחה</h2>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2">שינוי קוד סודי:</label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="קוד חדש (4 ספרות)"
                    className="w-full p-4 rounded-xl border-2 border-gray-50 focus:border-gray-300 outline-none text-center text-2xl font-bubblegum tracking-[0.5rem]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md active:scale-95 text-xl"
                >
                  עדכן קוד
                </button>
                {passwordUpdateMessage && (
                  <p className={`text-center font-bold ${passwordUpdateMessage.includes('בהצלחה') ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordUpdateMessage}
                  </p>
                )}
              </form>
            </section>

            {/* Purchase History */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-blue-100">
              <div className="flex items-center gap-2 mb-6 text-blue-500">
                <History size={28} />
                <h2 className="text-2xl font-bold">היסטוריית קניות</h2>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-blue-100">
                {purchases.length === 0 ? (
                  <div className="text-center py-10 text-gray-400 italic">טרם בוצעו קניות...</div>
                ) : (
                  purchases.slice().reverse().map((purchase) => (
                    <div 
                      key={purchase.id} 
                      className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                        purchase.status === 'done' 
                          ? 'bg-gray-50 border-gray-200 opacity-60' 
                          : 'bg-blue-50 border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{purchase.rewardIcon}</span>
                        <div>
                          <div className={`font-bold ${purchase.status === 'done' ? 'text-gray-500' : 'text-blue-700'}`}>
                            {purchase.rewardName}
                          </div>
                          <div className="text-sm text-blue-400">
                            {new Date(purchase.timestamp).toLocaleString('he-IL')}
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => togglePurchaseStatus(purchase.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                          purchase.status === 'done'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
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

          {/* Left Column: Rewards Management */}
          <div className="flex flex-col gap-6">
            {/* Add Reward Form */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-pink-100">
              <div className="flex items-center gap-2 mb-6 text-pink-500">
                <Plus size={28} />
                <h2 className="text-2xl font-bold">הוספת פרס חדש</h2>
              </div>
              <form onSubmit={handleAddReward} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="שם הפרס"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="p-4 rounded-xl border-2 border-purple-50 focus:border-purple-300 outline-none"
                    required
                  />
                  <input
                    type="number"
                    placeholder="מחיר"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="p-4 rounded-xl border-2 border-purple-50 focus:border-purple-300 outline-none"
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="אייקון (אמוג'י)"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  className="p-4 rounded-xl border-2 border-purple-50 focus:border-purple-300 outline-none text-2xl text-center"
                  required
                />
                <button
                  type="submit"
                  className="bg-green-400 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <Plus /> הוסף לחנות
                </button>
              </form>
            </section>

            {/* Current Rewards List */}
            <section className="bg-white p-8 rounded-[2rem] shadow-xl border-4 border-purple-100">
              <div className="flex items-center gap-2 mb-6 text-purple-500">
                <Package size={28} />
                <h2 className="text-2xl font-bold">פרסים בחנות</h2>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-purple-100">
                {rewards.map((reward) => (
                  <div key={reward.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border-2 border-purple-100">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{reward.icon}</span>
                      <div>
                        <div className="font-bold text-purple-700">{reward.name}</div>
                        <div className="text-sm text-purple-400">{reward.price} מטבעות</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => deleteReward(reward.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
