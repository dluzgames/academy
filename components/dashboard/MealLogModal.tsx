'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Utensils, Clock, Flame, Zap, Search, Check, Scale, Lock } from 'lucide-react';
import { Meal } from '@/types';
import { searchFood, Food } from '@/utils/nutrition-service';

interface MealLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeal: (meal: Omit<Meal, 'id'>) => void;
}

const CATEGORIES = [
  { id: 'breakfast', label: 'Café da Manhã' },
  { id: 'lunch', label: 'Almoço' },
  { id: 'dinner', label: 'Jantar' },
  { id: 'snack', label: 'Lanche' }
] as const;

const QUANTITY_PRESETS = [50, 100, 150, 200];

export default function MealLogModal({ isOpen, onClose, onAddMeal }: MealLogModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Meal['category']>('breakfast');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Base nutritional values per 100g (from database)
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Quantity in grams
  const [quantity, setQuantity] = useState(100);
  const [customQuantity, setCustomQuantity] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  // Calculated values (derived from selectedFood + quantity)
  const calories = selectedFood ? Math.round((selectedFood.calories * quantity) / 100) : 0;
  const protein = selectedFood ? Math.round(((selectedFood.protein * quantity) / 100) * 10) / 10 : 0;
  const carbs = selectedFood ? Math.round(((selectedFood.carbs * quantity) / 100) * 10) / 10 : 0;
  const fats = selectedFood ? Math.round(((selectedFood.fats * quantity) / 100) * 10) / 10 : 0;

  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (name.length >= 2 && !selectedFood) {
      const results = searchFood(name);
      setSearchResults(results);
      setShowResults(results.length > 0);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [name, selectedFood]);

  const selectFood = (food: Food) => {
    setName(food.name);
    setSelectedFood(food);
    setShowResults(false);
    setQuantity(100);
    setIsCustom(false);
  };

  const clearSelection = () => {
    setSelectedFood(null);
    setName('');
    setQuantity(100);
    setIsCustom(false);
    setCustomQuantity('');
  };

  const handleQuantityPreset = (grams: number) => {
    setQuantity(grams);
    setIsCustom(false);
    setCustomQuantity('');
  };

  const handleCustomQuantity = (value: string) => {
    setCustomQuantity(value);
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedFood) return;

    onAddMeal({
      name: `${name} (${quantity}g)`,
      category,
      time,
      calories,
      protein,
      carbs,
      fats
    });

    // Reset form
    setName('');
    setSelectedFood(null);
    setQuantity(100);
    setIsCustom(false);
    setCustomQuantity('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 shrink-0">
              <div className="flex items-center gap-2">
                <Utensils className="text-[#00FF80]" size={20} />
                <h2 className="text-xl font-black text-white tracking-tighter">MISSÃO ALIMENTAR</h2>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
              <div className="p-5 space-y-4 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-zinc-800">
                {/* Category Selection */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${category === cat.id
                        ? 'bg-[#00FF80]/20 border-[#00FF80] text-[#00FF80]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                        }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Food Search */}
                <div className="space-y-1 relative">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Search size={10} /> Buscar Alimento (6.500+ itens 🌍)
                  </label>

                  {selectedFood ? (
                    <div className="w-full bg-zinc-900 border border-[#00FF80]/30 rounded-xl px-4 py-3 flex justify-between items-center">
                      <div>
                        <p className="text-white font-bold text-sm">{name}</p>
                        <p className="text-[10px] text-zinc-500">por 100g: {selectedFood.calories}kcal • {selectedFood.protein}g P • {selectedFood.carbs}g C • {selectedFood.fats}g G</p>
                      </div>
                      <button type="button" onClick={clearSelection} className="text-zinc-500 hover:text-red-400 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <input
                      autoFocus
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Arroz branco, Chicken Breast..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00FF80] transition-colors"
                      required
                    />
                  )}

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showResults && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden z-20 shadow-2xl max-h-48 overflow-y-auto"
                      >
                        {searchResults.map(food => (
                          <button
                            key={food.id}
                            type="button"
                            onClick={() => selectFood(food)}
                            className="w-full px-4 py-3 text-left hover:bg-zinc-800 flex justify-between items-center group transition-colors"
                          >
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-[#00FF80]">{food.name}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                                {food.calories}kcal • {food.protein}g P • {food.carbs}g C • {food.fats}g G
                              </p>
                            </div>
                            <Check size={14} className="text-[#00FF80] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quantity Selector - only shows after food selection */}
                {selectedFood && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Scale size={10} /> Quantidade (gramas)
                    </label>
                    <div className="flex gap-2">
                      {QUANTITY_PRESETS.map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => handleQuantityPreset(g)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${!isCustom && quantity === g
                            ? 'bg-[#00FF80]/20 border-[#00FF80] text-[#00FF80]'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                            }`}
                        >
                          {g}g
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setIsCustom(true); setCustomQuantity(quantity.toString()); }}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${isCustom
                          ? 'bg-[#00FF80]/20 border-[#00FF80] text-[#00FF80]'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                      >
                        Custom
                      </button>
                    </div>

                    {isCustom && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <input
                          autoFocus
                          type="number"
                          value={customQuantity}
                          onChange={(e) => handleCustomQuantity(e.target.value)}
                          placeholder="Quantidade em gramas"
                          min="1"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#00FF80] transition-colors text-sm"
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Time */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Clock size={10} /> Horário
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#00FF80] transition-colors"
                  />
                </div>

                {/* Nutritional Summary - READ ONLY */}
                {selectedFood && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                      <Lock size={10} /> Valores Nutricionais ({quantity}g)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Flame size={10} className="text-orange-500" />
                        </div>
                        <p className="text-lg font-black text-white">{calories}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">kcal</p>
                      </div>
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap size={10} className="text-purple-500" />
                        </div>
                        <p className="text-lg font-black text-white">{protein}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Prot (g)</p>
                      </div>
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap size={10} className="text-blue-500" />
                        </div>
                        <p className="text-lg font-black text-white">{carbs}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Carb (g)</p>
                      </div>
                      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap size={10} className="text-yellow-500" />
                        </div>
                        <p className="text-lg font-black text-white">{fats}</p>
                        <p className="text-[9px] text-zinc-500 uppercase font-bold">Gord (g)</p>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>

              <div className="p-5 border-t border-zinc-800 bg-zinc-950 shrink-0">
                <button
                  type="submit"
                  disabled={!selectedFood}
                  className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${selectedFood
                    ? 'bg-[#00FF80] text-black hover:bg-[#00e673] shadow-[0_0_20px_rgba(0,255,128,0.2)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                  <Plus size={20} />
                  {selectedFood ? `ADICIONAR ${quantity}g À DIETA` : 'SELECIONE UM ALIMENTO'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
