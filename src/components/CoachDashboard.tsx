import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { Save, LogOut, Users, DollarSign } from 'lucide-react';

export const CoachDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formularios
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [precio, setPrecio] = useState('');

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

    // Obtener perfil
    const { data: prof } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (prof) {
      setProfile(prof);
      setNombre(prof.nombre);
      setEspecialidad(prof.especialidad || '');
      setPrecio(prof.precio_mensual?.toString() || '0');
    }

    // Obtener clientes que me han contratado
    const { data: contr } = await supabase
      .from('contratos')
      .select('*, usuario:perfiles!contratos_usuario_id_fkey(nombre)')
      .eq('coach_id', userId);
    
    if (contr) setClients(contr);

    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from('perfiles')
      .update({ nombre, especialidad, precio_mensual: Number(precio) })
      .eq('id', profile.id);

    if (error) {
      Swal.fire('Error', 'No se pudo actualizar el perfil', 'error');
    } else {
      Swal.fire('¡Éxito!', 'Perfil actualizado correctamente', 'success');
      fetchData();
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

      // Subir archivo al bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Actualizar perfil
      const { error: updateError } = await supabase
        .from('perfiles')
        .update({ avatar_url: publicUrlData.publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      // Refrescar perfil
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

  if (loading) return <div className="text-center p-10 text-white">Cargando dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
      
      {/* Columna Izquierda: Editar Perfil */}
      <div className="md:col-span-1 bg-white rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800">Mi Perfil</h2>
          <button onClick={handleLogout} className="text-rose-500 hover:text-rose-600 font-bold flex items-center gap-2">
            <LogOut size={18} /> Salir
          </button>
        </div>

        <div className="flex flex-col items-center mb-8">
          <div 
            className="relative w-32 h-32 rounded-full border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center text-4xl font-black text-blue-500 cursor-pointer group shadow-inner"
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <span className="animate-pulse text-lg">Cargando...</span>
            ) : profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile.nombre?.charAt(0).toUpperCase()
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold">
              Cambiar Foto
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={uploadAvatar} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombre Público</label>
            <input 
              type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-medium focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Especialidad (Ej: Yoga, HIIT)</label>
            <input 
              type="text" required value={especialidad} onChange={e => setEspecialidad(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-slate-700 font-medium focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Precio Mensual (S/)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="number" required min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl pl-10 pr-4 py-3 text-slate-700 font-medium focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <button type="submit" className="w-full mt-4 bg-blue-600 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 hover:bg-blue-700 transition-colors">
            <Save size={20} /> Guardar Cambios
          </button>
        </form>
      </div>

      {/* Columna Derecha: Clientes */}
      <div className="md:col-span-2">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-lg">
            <Users size={32} className="mb-4 opacity-80" />
            <h3 className="text-4xl font-black">{clients.length}</h3>
            <p className="font-medium opacity-80">Clientes Activos</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-white shadow-lg">
            <DollarSign size={32} className="mb-4 opacity-80" />
            <h3 className="text-4xl font-black">S/ {clients.reduce((acc, curr) => acc + curr.monto, 0).toFixed(2)}</h3>
            <p className="font-medium opacity-80">Ingresos Mensuales</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-black text-slate-800 mb-6">Mis Alumnos</h2>
          
          {clients.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-slate-500 font-medium">Aún no tienes clientes suscritos.</p>
              <p className="text-sm text-slate-400 mt-1">Comparte tu perfil para empezar a ganar.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {clients.map(client => (
                <div key={client.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                      {client.usuario?.nombre?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{client.usuario?.nombre || 'Usuario Anónimo'}</h4>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Plan Activo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-emerald-500">S/ {client.monto}</p>
                    <p className="text-xs text-slate-400 capitalize">{client.metodo_pago}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
