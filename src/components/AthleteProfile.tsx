import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { Camera, LogOut, Save, User, Activity, ArrowLeft } from 'lucide-react';

export const AthleteProfile: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState<string>('');
  const [coaches, setCoaches] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      window.location.href = '/login';
      return;
    }

    const userId = sessionData.session.user.id;
    setEmail(sessionData.session.user.email || '');

    // Obtener perfil
    const { data: prof } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (prof) {
      setProfile(prof);
    }

    // Obtener mis coaches contratados
    const { data: contr } = await supabase
      .from('contratos')
      .select('*, coach:perfiles!contratos_coach_id_fkey(nombre, especialidad, avatar_url)')
      .eq('usuario_id', userId);
    
    const coachSession = sessionStorage.getItem('coach_contratado');

    if (contr && contr.length > 0) {
      setCoaches(contr);
    } else if (coachSession) {
      // MODO DEMO: Mostrar el coach contratado en esta sesión si la DB está vacía
      const demoData = JSON.parse(coachSession);
      setCoaches([{
        id: 'demo-contract-id',
        monto: demoData.precio,
        coach: { 
          nombre: demoData.nombre, 
          especialidad: 'Coach Premium Personalizado', 
          avatar_url: null 
        }
      }]);
    }

    setLoading(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;
      
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      await fetchData();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div className="text-center p-10 text-slate-800">Cargando perfil...</div>;

  return (
    <div className="max-w-lg mx-auto bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 flex flex-col mb-10 overflow-hidden relative z-10 border border-slate-100">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-100 bg-white relative z-20">
        
        {/* Flecha a la izquierda */}
        <a href="/" className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors">
          <ArrowLeft size={24} />
        </a>

        {/* Título centrado absolutamente */}
        <h1 className="text-slate-900 font-black tracking-widest text-sm sm:text-base uppercase absolute left-1/2 -translate-x-1/2">
          Mi Zona de Atleta
        </h1>

        {/* Espaciador invisible a la derecha para equilibrar el layout */}
        <div className="w-10 h-10"></div>
      </div>

      <div className="flex flex-col gap-8 relative pb-10">
        
        {/* Cover de fondo vibrante (Purple Tech) */}
        <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-r from-[#314175] to-[#5a60d6] overflow-hidden">
          {/* Tech lines SVG pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
               <path d="M10 10 L40 10 L40 40 M60 60 L90 60 L90 90 M0 50 L30 50 L30 80 M100 20 L70 20 L70 50" stroke="white" strokeWidth="1" fill="none"/>
               <circle cx="10" cy="10" r="2" fill="white"/>
               <circle cx="40" cy="40" r="2" fill="white"/>
               <circle cx="90" cy="90" r="2" fill="white"/>
               <circle cx="30" cy="80" r="2" fill="white"/>
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        {/* Cabecera del Perfil */}
        <div className="flex flex-col items-center relative z-10 pt-16">
          <div className="relative mb-5">
            {/* The double ring avatar */}
            <div className="p-1.5 bg-white rounded-full shadow-[0_8px_30px_-4px_rgba(79,70,229,0.3)]">
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[3px] border-[#e0e7ff] overflow-hidden bg-slate-50 flex items-center justify-center text-4xl font-black text-indigo-500 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <span className="animate-pulse text-lg">...</span>
                ) : profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.nombre?.charAt(0).toUpperCase()
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold">
                  <Camera size={24} />
                </div>
              </div>
            </div>
            {/* Badge Overlap */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#3b82f6] text-white text-[10px] font-bold px-5 py-1 rounded-full uppercase tracking-widest border-[3px] border-white shadow-sm whitespace-nowrap">
              Atleta
            </div>
          </div>
          
          <input type="file" ref={fileInputRef} onChange={uploadAvatar} accept="image/*" className="hidden" />

          <h2 className="text-2xl font-black text-[#1e293b] text-center truncate w-full mt-2 tracking-tight">{profile?.nombre}</h2>
          <p className="text-sm text-slate-500 text-center truncate w-full">{email}</p>
        </div>

        <div className="w-full h-px bg-slate-100 px-10">
          <div className="w-full h-full bg-slate-100"></div>
        </div>

        {/* Sección Mis Coaches */}
        <div className="flex flex-col gap-4 px-6 sm:px-10">
          <h3 className="text-lg font-bold text-[#1e293b]">Mis Coaches Contratados</h3>

          {coaches.length === 0 ? (
            <div className="border-[1.5px] border-[#1e293b]/80 bg-gradient-to-br from-[#e0f2fe] via-[#fef3c7] to-[#e0e7ff] rounded-[1.5rem] p-8 flex flex-col items-center text-center shadow-sm relative overflow-hidden">
              {/* Soft background glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/40 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-200/40 rounded-full blur-2xl"></div>
              
              <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-5 border-[1.5px] border-white relative z-10">
                <User className="text-orange-400" size={28} strokeWidth={1.5} />
              </div>
              <p className="text-[#334155] font-medium mb-8 text-[13px] leading-relaxed relative z-10">
                Aún no has contratado a ningún coach.<br/>
                <span className="text-slate-500">Lleva tu entrenamiento al siguiente nivel con un experto.</span>
              </p>
              <a href="/coaches" className="bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:from-[#4338ca] hover:to-[#6d28d9] text-white text-sm font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center gap-2 relative z-10">
                Explorar Coaches <span className="text-lg leading-none">→</span>
              </a>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {coaches.map(contrato => (
                <div key={contrato.id} className="flex items-center p-3 sm:p-4 bg-white border-[1.5px] border-[#1e293b]/10 shadow-sm rounded-[1.25rem] hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-50 mr-4 flex-shrink-0 border-2 border-indigo-50">
                    {contrato.coach?.avatar_url ? (
                      <img src={contrato.coach.avatar_url} alt="Coach" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg font-black text-indigo-400">
                        {contrato.coach?.nombre?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-[#1e293b] leading-tight">{contrato.coach?.nombre}</h4>
                    <p className="text-[11px] sm:text-xs text-indigo-500 font-medium mt-0.5">{contrato.coach?.especialidad || 'Coach Premium'}</p>
                  </div>
                  <div className="text-right ml-2 flex flex-col items-end">
                    <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Activo</span>
                    <p className="text-xs text-slate-600 mt-1 font-bold">S/ {contrato.monto}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full h-px bg-slate-100 px-10">
          <div className="w-full h-full bg-slate-100"></div>
        </div>

        {/* Botón Cerrar Sesión */}
        <div className="px-6 sm:px-10 mt-2">
          <button onClick={handleLogout} className="w-full py-4 bg-rose-500 text-white font-bold rounded-[1.25rem] flex items-center justify-center gap-2 hover:bg-rose-600 transition-colors shadow-md hover:shadow-lg">
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>

      </div>
    </div>
  );
};
