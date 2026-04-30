import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { Play, Pause, SkipForward, RotateCcw, Heart, Timer as TimerIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Ejercicio {
  id: number;
  nombre_ejercicio: string;
  instrucciones: string;
  duracion_segundos: number;
  url_video: string;
  url_musica?: string;
}

export const RutinaApp: React.FC = () => {
  const [view, setView] = useState<'intro' | 'exercise' | 'break' | 'countdown'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [breakTime, setBreakTime] = useState(10);
  const [countdown, setCountdown] = useState(3);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [ejercicios, setEjercicios] = useState<Ejercicio[]>([]);
  const [estado, setEstado] = useState<string>('triste');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRutinas = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const mood = searchParams.get('estado') || 'triste';
      setEstado(mood);
      
      const { data, error } = await supabase
        .from('rutinas')
        .select('*')
        .eq('estado_animo', mood.toLowerCase());
        
      if (data && data.length > 0) {
        setEjercicios(data);
      } else {
        setEjercicios([{
          id: 1,
          nombre_ejercicio: "Respiración Profunda",
          instrucciones: "Inhala profundamente por la nariz y exhala por la boca.",
          duracion_segundos: 20,
          url_video: "https://www.w3schools.com/html/mov_bbb.mp4",
          url_musica: ""
        }]);
      }
      setLoading(false);
    };
    fetchRutinas();
  }, []);

  const currentEjercicio = ejercicios[currentIndex];

  const contextos: Record<string, string> = {
    'triste': "Eleva energía suavemente.", 'cansado': "Oxigena tu cerebro.", 
    'estresado': "Descarga tensión.", 'enojado': "Canaliza energía.", 
    'alegre': "Mantén energía alta.", 'emocionado': "Rompe límites.", 
    'aburrido': "Despierta sentidos.", 'ansioso': "Recupera calma.", 
    'energico': "Quema calorías.", 'inseguro': "Adopta poder."
  };

  const musicaPorEstado: Record<string, string> = {
    'triste': "/musica/piano.mp3",
    'cansado': "/musica/relax.mp3",
    'estresado': "/musica/relax.mp3",
    'enojado': "/musica/rock.mp3",
    'alegre': "/musica/pop.mp3",
    'emocionado': "/musica/pop.mp3",
    'aburrido': "/musica/pop.mp3",
    'ansioso': "/musica/relax.mp3",
    'energico': "/musica/rock.mp3",
    'inseguro': "/musica/rock.mp3"
  };

  const frasesDescanso = ["Recupera el aliento...", "Lo estás haciendo genial.", "Inhala profundo...", "Siente tu fuerza.", "Sigue así."];

  useEffect(() => {
    if (view === 'exercise' && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && view === 'exercise') {
      irADescanso();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view, isPaused, timeLeft]);

  // Manejar el reproductor de audio automáticamente
  useEffect(() => {
    if (view === 'exercise' && !isPaused && audioRef.current) {
      audioRef.current.play().catch((e) => console.log("El navegador bloqueó el autoplay del audio", e));
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [view, isPaused, currentIndex]);

  useEffect(() => {
    if (view === 'break' && breakTime > 0) {
      const breakTimer = setInterval(() => {
        setBreakTime((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(breakTimer);
    } else if (breakTime === 0 && view === 'break') {
      if (currentIndex < ejercicios.length - 1) {
        cargarEjercicio(currentIndex + 1);
      } else {
        finalizarRutina();
      }
    }
  }, [view, breakTime]);

  useEffect(() => {
    if (view === 'countdown' && countdown > -1) {
      const cdTimer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(cdTimer);
    } else if (countdown === -1 && view === 'countdown') {
      setView('exercise');
      cargarEjercicio(0);
    }
  }, [view, countdown]);

  const cargarEjercicio = (index: number) => {
    setCurrentIndex(index);
    setTimeLeft(ejercicios[index].duracion_segundos);
    setView('exercise');
    setIsPaused(false);
  };

  const irADescanso = () => {
    if (currentIndex >= ejercicios.length - 1) {
      finalizarRutina();
    } else {
      setView('break');
      setBreakTime(10);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (videoRef.current) {
      isPaused ? videoRef.current.play() : videoRef.current.pause();
    }
    if (audioRef.current) {
      isPaused ? audioRef.current.play() : audioRef.current.pause();
    }
  };

  const finalizarRutina = () => {
    // Detener la música y el video
    if (audioRef.current) audioRef.current.pause();
    if (videoRef.current) videoRef.current.pause();
    setIsPaused(true);

    const totalSegundos = ejercicios.reduce((acc, curr) => acc + curr.duracion_segundos, 0);
    
    // --- CÁLCULO CIENTÍFICO DE CALORÍAS (Formula METs) ---
    // Intentar leer el peso del usuario desde localStorage
    let pesoKg = 70; // Peso promedio estándar como fallback
    try {
      const profile = localStorage.getItem('userProfile');
      if (profile) {
        pesoKg = JSON.parse(profile).weight || 70;
      }
    } catch(e) {}

    const horas = totalSegundos / 3600;

    const metsPorEstado: Record<string, number> = {
      'triste': 2.5,     // Estiramientos suaves / Yoga Hatha
      'cansado': 2.0,    // Movilidad muy suave
      'estresado': 3.0,  // Yoga / Pilates
      'ansioso': 2.5,    // Respiración / Yoga restaurativo
      'aburrido': 4.0,   // Calistenia moderada
      'inseguro': 3.8,   // Entrenamiento de fuerza básico
      'alegre': 5.0,     // Aeróbicos de impacto bajo/medio
      'enojado': 6.0,    // Kickboxing / Alta intensidad
      'emocionado': 7.0, // Cardio intenso
      'energico': 8.0    // HIIT / Circuito vigoroso
    };

    const met = metsPorEstado[estado.toLowerCase()] || 4.0;
    const calorias = Math.max(1, Math.round(met * pesoKg * horas)); // Fórmula: Kcal = MET x Kg x Horas
    
    Swal.fire({
      html: `
        <div class="flex flex-col items-center">
          <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_10px_30px_rgba(16,185,129,0.3)] mx-auto border-4 border-white">
            <svg class="w-12 h-12 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 class="text-3xl font-black text-[#1e293b] mb-2 tracking-tight">¡Misión Cumplida!</h2>
          <div class="text-slate-500 font-medium mb-8 text-sm">Has finalizado tu rutina con éxito.</div>
          
          <div class="grid grid-cols-2 gap-4 w-full">
            <div class="bg-gradient-to-br from-rose-50 to-orange-50 p-5 rounded-3xl border border-rose-100 text-center shadow-sm">
              <span class="text-4xl block mb-2 drop-shadow-sm">🔥</span>
              <strong class="text-3xl font-black text-rose-600 block leading-none mb-1">${calorias}</strong>
              <div class="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Kcal Quemadas</div>
            </div>
            <div class="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-3xl border border-indigo-100 text-center shadow-sm">
              <span class="text-4xl block mb-2 drop-shadow-sm">⏱️</span>
              <strong class="text-3xl font-black text-indigo-600 block leading-none mb-1">${Math.floor(totalSegundos/60)}<span class="text-xl">:${(totalSegundos%60).toString().padStart(2,'0')}</span></strong>
              <div class="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Tiempo Total</div>
            </div>
          </div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Finalizar y Volver',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-[2rem] p-6 sm:p-8',
        confirmButton: 'mt-8 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black tracking-wide py-4 px-8 rounded-2xl text-lg shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:shadow-lg hover:-translate-y-1 transition-all',
      },
      showCloseButton: false,
      allowOutsideClick: false,
    }).then(() => {
      window.location.href = "/";
    });
  };

  if (loading) {
    return <div className="text-white font-bold text-center py-20">Cargando tu rutina personalizada...</div>;
  }

  if (ejercicios.length === 0) {
    return (
      <div className="text-white text-center">
        <h2 className="text-2xl font-bold">No se encontraron rutinas para "{estado}"</h2>
        <a href="/" className="mt-4 inline-block text-blue-400 underline">Volver al inicio</a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg bg-white min-h-[100vh] md:min-h-[700px] md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden relative">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-6 text-center text-white rounded-b-[2rem] shadow-lg shrink-0 relative">
        <a href="/" className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
          <span className="text-xl leading-none">←</span>
        </a>
        <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Rutina Personalizada</p>
        <h1 className="text-2xl font-black uppercase tracking-tighter">{estado}</h1>
      </header>

      <div className="flex-grow flex flex-col p-6">
        {view === 'intro' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-700 relative">
            
            {/* Elemento Gráfico Central (Corazón Pulsante) */}
            <div className="relative w-40 h-40 flex items-center justify-center mb-10">
              {/* Anillos animadas de fondo */}
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-[0.15]"></div>
              <div className="absolute inset-4 bg-indigo-100 rounded-full animate-pulse"></div>
              
              {/* Círculo Principal */}
              <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-4 border-white z-10 overflow-hidden group">
                <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Heart className="w-10 h-10 text-indigo-500 fill-indigo-500/20 drop-shadow-md relative z-10" />
              </div>
            </div>

            {/* Tipografía Mejorada */}
            <h2 className="text-3xl sm:text-4xl font-black text-[#1e293b] tracking-tight mb-4">Tu Objetivo</h2>
            
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-8 py-4 rounded-3xl border border-indigo-100/50 mb-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
              <p className="text-indigo-600 text-lg sm:text-xl font-bold tracking-wide">
                {contextos[estado.toLowerCase()] || "Prepara tu cuerpo y mente."}
              </p>
            </div>

            {/* Botón Premium Brillante */}
            <button 
              onClick={() => setView('countdown')}
              className="relative group w-full max-w-xs"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative py-4 sm:py-5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 ring-1 ring-white/50 text-white rounded-full font-black text-lg tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all overflow-hidden flex items-center justify-center gap-2">
                <span className="relative z-10 uppercase">¿Estás Listo?</span>
                <span className="relative z-10 text-xl leading-none">→</span>
                <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              </div>
            </button>
          </div>
        )}

        {view === 'countdown' && (
          <div className="flex-grow flex flex-col items-center justify-center relative">
            {/* Resplandor de fondo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>

            <div className="bg-indigo-50 border border-indigo-100 px-6 py-2.5 rounded-full mb-12 z-10 shadow-sm">
              <h3 className="text-indigo-700 font-black tracking-[0.2em] uppercase text-sm sm:text-base animate-pulse">
                Prepárate para iniciar
              </h3>
            </div>
            
            <div className="relative w-64 h-64 flex items-center justify-center z-10">
              {/* Anillos de radar concéntricos giratorios */}
              <div className="absolute inset-0 rounded-full border border-indigo-100"></div>
              <div className="absolute inset-4 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-8 rounded-full border-2 border-purple-100 border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
              
              {/* Pulso expansivo que se reinicia cada segundo */}
              <div key={`pulse-${countdown}`} className="absolute inset-12 bg-gradient-to-tr from-indigo-200 to-purple-200 rounded-full animate-ping opacity-30"></div>
              
              {/* Contenedor central flotante */}
              <div className="absolute inset-10 bg-white rounded-full shadow-[0_10px_40px_rgba(79,70,229,0.2)] flex items-center justify-center border-4 border-white">
                {/* Número con animación de zoom y desvanecimiento cada segundo */}
                <span 
                  key={countdown} 
                  className="text-[6.5rem] leading-none font-black bg-gradient-to-br from-[#4f46e5] to-[#9333ea] bg-clip-text text-transparent drop-shadow-sm animate-in zoom-in-50 fade-in duration-300"
                >
                  {countdown === 0 ? "¡YA!" : countdown}
                </span>
              </div>
            </div>
          </div>
        )}

        {view === 'exercise' && currentEjercicio && (
          <div className="flex-grow flex flex-col animate-in slide-in-from-right duration-500">
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl border-4 border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold text-center">Ejercicio</span>
                <span className="text-xs font-black text-slate-800 truncate text-center">{currentEjercicio.nombre_ejercicio}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-4 border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold text-center">Serie</span>
                <span className="text-sm font-black text-slate-800 text-center">{currentIndex + 1}/{ejercicios.length}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border-4 border-slate-100 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 uppercase font-bold text-center">Tiempo</span>
                <span className="text-sm font-black text-blue-600 text-center">
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative mb-6">
              <video 
                key={currentEjercicio.url_video}
                ref={videoRef}
                src={currentEjercicio.url_video} 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                muted
              />
              {isPaused && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Play className="text-white w-20 h-20 opacity-80" />
                </div>
              )}
            </div>

            <p className="text-center text-slate-600 font-medium mb-8 min-h-[3rem]">
              {currentEjercicio.instrucciones}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex-grow h-3 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${((currentIndex + ( (currentEjercicio.duracion_segundos - timeLeft) / currentEjercicio.duracion_segundos)) / ejercicios.length) * 100}%` }}
                />
              </div>
              <span className="text-xs font-black text-blue-500 w-8">
                {Math.round(((currentIndex + ( (currentEjercicio.duracion_segundos - timeLeft) / currentEjercicio.duracion_segundos)) / ejercicios.length) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-auto">
              <button 
                onClick={togglePause}
                className={`py-4 rounded-2xl text-white font-bold text-xs flex flex-col items-center justify-center gap-1 transition-colors ${isPaused ? 'bg-blue-500' : 'bg-orange-400'}`}
              >
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
                {isPaused ? 'Reanudar' : 'Pausar'}
              </button>
              <button 
                onClick={irADescanso}
                className="py-4 bg-purple-500 rounded-2xl text-white font-bold text-xs flex flex-col items-center justify-center gap-1"
              >
                <SkipForward size={20} />
                Saltar
              </button>
              <button 
                onClick={() => {
                  setTimeLeft(currentEjercicio.duracion_segundos);
                  setIsPaused(false);
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    videoRef.current.play();
                  }
                  if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play();
                  }
                }}
                className="py-4 bg-rose-500 rounded-2xl text-white font-bold text-xs flex flex-col items-center justify-center gap-1"
              >
                <RotateCcw size={20} />
                Reiniciar
              </button>
            </div>
          </div>
        )}

        {view === 'break' && (
          <div className="flex-grow flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 relative">
            
            {/* Brillo de fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <h2 className="text-4xl font-black text-[#1e293b] mb-3 tracking-tight">¡Bien hecho!</h2>
            
            <div className="bg-purple-50 px-5 py-2 rounded-full mb-10 border border-purple-100 shadow-sm">
              <p className="text-purple-600 font-bold uppercase text-xs tracking-[0.2em]">Tómate un respiro</p>
            </div>
            
            <div className="relative w-56 h-56 flex items-center justify-center mb-10">
              {/* Anillo base estático */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" stroke="#f8fafc" strokeWidth="6" fill="none" />
                {/* Anillo de progreso SVG */}
                <circle 
                  cx="50" cy="50" r="46" 
                  stroke="url(#purpleGradient)" 
                  strokeWidth="6" 
                  fill="none" 
                  strokeLinecap="round"
                  strokeDasharray="289" 
                  style={{ 
                    strokeDashoffset: 289 - (289 * (breakTime / 10)),
                    transition: 'stroke-dashoffset 1s linear'
                  }}
                />
                <defs>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Centro de la dona con el número estático */}
              <div className="absolute inset-4 bg-white rounded-full shadow-[0_0_40px_rgba(168,85,247,0.12)] flex flex-col items-center justify-center border border-purple-50">
                <span className="text-[5rem] leading-none font-black bg-gradient-to-br from-purple-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                  {breakTime}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Segundos</span>
              </div>
            </div>

            {/* Frase fija basada en el índice del ejercicio para evitar que parpadee cada segundo */}
            <p className="italic text-slate-500 font-medium mb-12 text-lg px-6">
              "{frasesDescanso[currentIndex % frasesDescanso.length]}"
            </p>

            {/* Tarjeta de Siguiente Ejercicio Mejorada (Hacemos que sea un botón para saltar el descanso) */}
            <button 
              onClick={() => {
                if (currentIndex < ejercicios.length - 1) {
                  cargarEjercicio(currentIndex + 1);
                } else {
                  finalizarRutina();
                }
              }}
              className="bg-gradient-to-r from-slate-50 to-purple-50/50 p-1.5 rounded-[2rem] w-full shadow-sm border border-slate-100/80 group hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 text-left"
            >
              <div className="bg-white p-5 rounded-[1.5rem] w-full flex items-center justify-between relative overflow-hidden shadow-sm">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-500 group-hover:w-3 transition-all"></div>
                <div className="text-left pl-3 flex-grow">
                  <span className="text-[10px] text-purple-400 uppercase font-black block mb-1 tracking-wider">Saltar y continuar a</span>
                  <span className="text-lg sm:text-xl font-black text-[#1e293b] truncate block pr-2">
                    {ejercicios[currentIndex + 1]?.nombre_ejercicio || "Finalizar Rutina"}
                  </span>
                </div>
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors border border-purple-100">
                  <Play size={20} className="ml-1 fill-current opacity-80" />
                </div>
              </div>
            </button>
          </div>
        )}
      </div>

      <audio key={currentEjercicio?.url_musica || musicaPorEstado[estado.toLowerCase()] || "/musica/pop.mp3"} ref={audioRef} loop src={currentEjercicio?.url_musica || musicaPorEstado[estado.toLowerCase()] || "/musica/pop.mp3"} />
    </div>
  );
};

