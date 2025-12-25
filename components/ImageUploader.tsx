
import React, { useRef } from 'react';

interface ImageUploaderProps {
  label: string;
  onImageUpload: (dataUrl: string) => void;
  currentImage?: string;
  icon: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ label, onImageUpload, currentImage, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all">
      <div className="text-sm font-semibold text-white/90 uppercase tracking-wider">{label}</div>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-24 h-24 rounded-full bg-blue-500/30 flex items-center justify-center cursor-pointer overflow-hidden border-2 border-dashed border-white/40 hover:border-blue-400"
      >
        {currentImage ? (
          <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <i className={`${icon} text-3xl text-white/60`}></i>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        className="hidden" 
        accept="image/*" 
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1 bg-white text-blue-600 rounded-full text-xs font-bold shadow-md active:scale-95 transition-transform"
      >
        CHOOSE
      </button>
    </div>
  );
};

export default ImageUploader;
