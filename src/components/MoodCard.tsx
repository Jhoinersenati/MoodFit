import React from 'react';

interface MoodCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  image?: string;
}

export const MoodCard: React.FC<MoodCardProps> = ({ id, name, icon, image }) => {
  return (
    <a
      href={`/rutina?estado=${id}`}
      className="group relative flex flex-col justify-end p-5 h-40 sm:h-48 rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-95 border-2 border-[#b86a55]/60 hover:border-[#b86a55]"
    >
      {/* Background Image */}
      {image && (
        <img 
          src={image} 
          alt={name} 
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
      <div className="absolute inset-0 bg-[#b86a55]/10 mix-blend-overlay group-hover:bg-[#b86a55]/20 transition-colors duration-300" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full transform group-hover:scale-105 transition-transform duration-300">
        <span className="material-symbols-rounded text-4xl text-white mb-2 drop-shadow-lg">
          {icon}
        </span>
        <span className="text-white font-black tracking-widest text-xl sm:text-2xl drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-center">
          {name}
        </span>
      </div>
    </a>
  );
};
