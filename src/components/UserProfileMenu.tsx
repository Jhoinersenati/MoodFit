import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const UserProfileMenu: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { data: prof } = await supabase
          .from('perfiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        if (prof) setProfile(prof);
      }
    };
    
    fetchUser();
  }, []);

  if (!profile) return null;

  // Si es coach, va al dashboard. Si es atleta, va a su nueva página de perfil.
  const targetUrl = profile.rol === 'coach' ? '/dashboard' : '/perfil';

  return (
    <a 
      href={targetUrl}
      className="flex items-center gap-2 bg-[#b86a55] hover:bg-[#a65d4a] text-white px-5 py-2.5 rounded-full font-bold transition-all border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-xs overflow-hidden">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          profile.nombre.charAt(0).toUpperCase()
        )}
      </div>
      <span>MI PERFIL</span>
    </a>
  );
};
