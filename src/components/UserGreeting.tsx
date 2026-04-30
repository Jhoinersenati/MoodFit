import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const UserGreeting: React.FC = () => {
  const [name, setName] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: profile } = await supabase
          .from('perfiles')
          .select('nombre')
          .eq('id', data.session.user.id)
          .single();
        if (profile) setName(profile.nombre);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="flex flex-col items-center p-8 bg-[#b86a55] rounded-3xl border-2 border-white/20 w-full max-w-2xl shadow-2xl relative overflow-hidden">
      <h3 className="text-3xl md:text-5xl font-black text-white mb-2 text-center leading-tight relative z-10 drop-shadow-md">
        ¡Hola, {name}!
      </h3>
      <p className="text-white/90 font-medium text-xl md:text-2xl mt-2 text-center relative z-10 drop-shadow-sm">
        ¿Cómo te sientes hoy?
      </p>
    </div>
  );
};
