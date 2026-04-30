import React, { useState, useEffect } from 'react';

export const Onboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    // Si no hay perfil (peso), lo abrimos.
    if (!profile || !JSON.parse(profile).weight) {
      setIsOpen(true);
    }
    setIsLoaded(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (weight) {
      localStorage.setItem('userProfile', JSON.stringify({ weight: Number(weight) }));
      setIsOpen(false);
      window.dispatchEvent(new Event('profileUpdated')); // Trigger event to update other components
    }
  };

  if (!isLoaded || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <span className="text-4xl mb-2 block">⚖️</span>
          <h2 className="text-2xl font-black text-slate-800">Un último paso</h2>
          <p className="text-sm text-slate-500 mt-2">Para calcular tus calorías exactas en cada rutina, ingresa tu peso actual.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tu Peso (KG)</label>
            <input 
              type="number" 
              required
              min="30"
              max="250"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Ej. 70"
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95"
          >
            Guardar y Comenzar
          </button>
        </form>
      </div>
    </div>
  );
};
