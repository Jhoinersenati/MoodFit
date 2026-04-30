import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { User, Dumbbell, Mail, Lock } from 'lucide-react';

export const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'usuario' | 'coach'>('usuario');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/'; // Redirigir al home (rutinas)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.user) {
          // Insert profile
          const { error: profileError } = await supabase.from('perfiles').insert([
            { 
              id: data.user.id, 
              nombre, 
              rol, 
              precio_mensual: rol === 'coach' ? 50.00 : 0,
              especialidad: rol === 'coach' ? 'Fitness General' : null
            }
          ]);
          if (profileError) throw profileError;
        }

        Swal.fire('¡Registro Exitoso!', 'Bienvenido a la plataforma', 'success').then(() => {
          window.location.href = rol === 'coach' ? '/dashboard' : '/'; // Atletas van al home
        });
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Ha ocurrido un problema', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 sm:p-12 shadow-2xl relative overflow-hidden border border-white/20 backdrop-blur-xl">
      {/* Decorative background elements inside the card */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600"></div>
      
      <div className="text-center mb-10 relative z-10">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm rotate-3">
          <User className="text-indigo-600 w-8 h-8 -rotate-3" />
        </div>
        <h2 className="text-4xl font-black text-[#1e293b] tracking-tight">
          {isLogin ? 'Bienvenido' : 'Únete ahora'}
        </h2>
        <p className="text-slate-500 mt-3 text-base font-medium px-4">
          {isLogin ? 'Ingresa a tu cuenta para continuar tu entrenamiento' : 'Crea tu cuenta como atleta o entrenador personal'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-6 relative z-10">
        {!isLogin && (
          <div className="flex gap-4 mb-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => setRol('usuario')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black transition-all duration-300 ${rol === 'usuario' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/50 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 hover:scale-100'}`}
            >
              <User size={18} /> Atleta
            </button>
            <button
              type="button"
              onClick={() => setRol('coach')}
              className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 font-black transition-all duration-300 ${rol === 'coach' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50 scale-100' : 'text-slate-400 hover:text-slate-600 scale-95 hover:scale-100'}`}
            >
              <Dumbbell size={18} /> Coach
            </button>
          </div>
        )}

        {!isLogin && (
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all hover:border-slate-200"
              placeholder="Tu nombre completo"
            />
          </div>
        )}

        <div className="relative group">
          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} />
          <input 
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all hover:border-slate-200"
            placeholder="Correo electrónico"
          />
        </div>

        <div className="relative group">
          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} />
          <input 
            type="password" required value={password} onChange={e => setPassword(e.target.value)}
            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 text-slate-800 font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all hover:border-slate-200"
            placeholder="Contraseña"
          />
        </div>

        <button 
          disabled={loading}
          className="w-full mt-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-lg py-5 rounded-2xl shadow-[0_10px_25px_rgba(79,70,229,0.25)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.35)] hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 overflow-hidden relative group"
        >
          <span className="relative z-10 tracking-widest uppercase">{loading ? 'Procesando...' : (isLogin ? 'Ingresar a mi cuenta' : 'Crear mi cuenta')}</span>
          {!loading && <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>}
        </button>
      </form>

      <div className="mt-10 text-center relative z-10">
        <button 
          type="button" 
          onClick={() => setIsLogin(!isLogin)}
          className="text-base font-bold transition-colors group"
        >
          {isLogin ? (
            <><span className="text-red-500">¿No tienes cuenta?</span> <span className="text-indigo-600 group-hover:underline underline-offset-4 decoration-2">Regístrate aquí</span></>
          ) : (
            <><span className="text-red-500">¿Ya tienes cuenta?</span> <span className="text-indigo-600 group-hover:underline underline-offset-4 decoration-2">Inicia sesión</span></>
          )}
        </button>
      </div>
    </div>
  );
};
