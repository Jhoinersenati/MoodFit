import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { CreditCard, Smartphone, CheckCircle, ShieldCheck } from 'lucide-react';

interface CheckoutProps {
  coachId: string;
  coachName: string;
  price: string;
}

export const Checkout: React.FC<CheckoutProps> = ({ coachId, coachName, price }) => {
  const [method, setMethod] = useState<'tarjeta' | 'yape'>('tarjeta');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      Swal.fire('Atención', 'Debes iniciar sesión para contratar a un coach', 'warning').then(() => {
        window.location.href = '/login';
      });
      return;
    }

    setLoading(true);

    // Simular procesamiento de pago de 2 segundos
    setTimeout(async () => {
      try {
        // Validar si el coachId es un UUID válido para evitar errores de sintaxis en Postgres
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(coachId);

        if (coachId && isUuid && !coachId.startsWith('mock')) {
          const { error } = await supabase.from('contratos').insert([
            {
              usuario_id: userId,
              coach_id: coachId,
              metodo_pago: method,
              monto: Number(price)
            }
          ]);
          if (error) throw error;
        }

        Swal.fire({
          title: '¡Pago Exitoso!',
          html: `<p>Has contratado a <b>${coachName}</b> exitosamente.</p><p class="text-sm mt-2 text-slate-500">Recibo enviado a tu correo.</p>`,
          icon: 'success',
          didOpen: () => {
            // Guardar en la sesión que se contrató un coach para la demo
            sessionStorage.setItem('coach_contratado', JSON.stringify({ nombre: coachName, precio: price }));
          },
          confirmButtonText: 'Ir a mi panel',
          confirmButtonColor: '#4c6ef5'
        }).then(() => {
          window.location.href = '/perfil'; // Dirigir directamente al perfil para ver el resultado
        });

      } catch (error: any) {
        Swal.fire('Error en el pago', error.message || 'No se pudo procesar la transacción', 'error');
      } finally {
        setLoading(false);
      }
    }, 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
      {/* Resumen del Pedido */}
      <div className="w-full md:w-2/5 bg-slate-900 text-white p-8 md:p-12">
        <p className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-2">Resumen de Contratación</p>
        <h2 className="text-3xl font-black mb-8">{coachName}</h2>
        
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center pb-4 border-b border-slate-700">
            <span className="text-slate-400">Plan Mensual Personalizado</span>
            <span className="font-bold">S/ {price}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-700">
            <span className="text-slate-400">Impuestos (IGV 18%)</span>
            <span className="font-bold">Incluido</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center text-2xl font-black mt-12">
          <span>Total</span>
          <span>S/ {price}</span>
        </div>

        <div className="mt-12 flex items-center gap-3 text-sm text-slate-400">
          <ShieldCheck size={20} className="text-green-400" />
          <span>Pago 100% seguro y encriptado</span>
        </div>
      </div>

      {/* Formulario de Pago */}
      <div className="w-full md:w-3/5 p-8 md:p-12 bg-slate-50">
        <h3 className="text-2xl font-black text-slate-800 mb-8">Método de Pago</h3>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setMethod('tarjeta')}
            className={`flex-1 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${method === 'tarjeta' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200'}`}
          >
            <CreditCard size={28} />
            <span className="font-bold">Tarjeta</span>
          </button>
          
          <button 
            onClick={() => setMethod('yape')}
            className={`flex-1 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${method === 'yape' ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md' : 'border-slate-200 bg-white text-slate-500 hover:border-purple-200'}`}
          >
            <Smartphone size={28} />
            <span className="font-bold">Yape / Plin</span>
          </button>
        </div>

        <form onSubmit={handlePayment} className="space-y-6">
          {method === 'tarjeta' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Número de Tarjeta</label>
                <input type="text" placeholder="0000 0000 0000 0000" maxLength={19} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vencimiento</label>
                  <input type="text" placeholder="MM/AA" maxLength={5} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CVC</label>
                  <input type="text" placeholder="123" maxLength={4} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Titular de la Tarjeta</label>
                <input type="text" placeholder="Juan Pérez" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" />
              </div>
            </div>
          )}

          {method === 'yape' && (
            <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-purple-200 text-center animate-in fade-in duration-300">
              <div className="w-48 h-48 bg-slate-100 mx-auto rounded-xl flex items-center justify-center mb-6">
                <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" alt="QR Yape" className="w-40 h-40 opacity-50" />
              </div>
              <h4 className="font-black text-slate-800 text-xl mb-2">Escanea para Pagar</h4>
              <p className="text-slate-500 mb-6">Abre tu app de Yape o Plin y escanea este código para completar el pago exacto de S/ {price}.</p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-left">Número de celular asociado</label>
                <input type="text" placeholder="999 888 777" maxLength={9} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 outline-none font-mono" />
              </div>
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-4 mt-4 bg-slate-900 text-white rounded-xl font-black text-lg flex justify-center items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-pulse">Procesando pago...</span>
            ) : (
              <>Pagar S/ {price} segurmanente <CheckCircle size={20} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
