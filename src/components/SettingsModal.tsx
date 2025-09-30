import { CSSProperties } from 'react';

// --- Ícone de Configurações ---
export const SettingsIcon = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.44,0.17-0.48,0.41L9.12,4.84C8.53,5.08,8,5.4,7.5,5.78L5.11,4.81C4.89,4.74,4.64,4.81,4.52,5.03L2.6,8.35 c-0.12,0.2-0.07,0.47,0.12,0.61L4.75,10.54C4.7,10.84,4.68,11.16,4.68,11.5c0,0.33,0.02,0.65,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.48,2.03 c0.04,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.48-0.41l0.48-2.03c0.59-0.24,1.12-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0.01,0.59-0.22l1.92-3.32c0.12-0.2,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.5c-1.93,0-3.5-1.57-3.5-3.5 s1.57-3.5,3.5-3.5s3.5,1.57,3.5,3.5S13.93,15.5,12,15.5z" />
  </svg>
);

// --- Tipos e Interfaces ---
type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  isCaseSensitive: boolean;
  setIsCaseSensitive: (isSensitive: boolean) => void;
};

// --- Componente do Modal de Configurações ---
const SettingsModal = ({
  isOpen,
  onClose,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  isCaseSensitive,
  setIsCaseSensitive,
}: SettingsModalProps) => {
  const fonts = ['Inter', 'Montserrat', 'Poppins', 'Arial', 'Verdana'];
  const panelStyle: CSSProperties = {
    transform: isOpen ? 'translateX(0)' : 'translateX(calc(100% + 1rem))',
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${isOpen ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
      />
      
      {/* Painel */}
      <div style={panelStyle} className="fixed bottom-20 right-4 bg-[#1D1E22] p-6 rounded-lg shadow-xl w-full max-w-sm border border-gray-700 transition-transform duration-300 ease-in-out z-50">
        <h2 className="text-lg font-bold mb-6 text-gray-300">Configurações</h2>
        
        <div className="mb-6">
          <label htmlFor="fontSize" className="block text-xs font-medium text-gray-400 mb-2">
            Tamanho da Fonte: {fontSize}px
          </label>
          <input id="fontSize" type="range" min="12" max="24" step="1" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
        </div>

        <div className="mb-6">
          <label htmlFor="fontFamily" className="block text-xs font-medium text-gray-400 mb-2">Fonte</label>
          <select id="fontFamily" value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="w-full p-2 bg-[#2a2b2f] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
            {fonts.map((font) => (<option key={font} value={font}>{font}</option>))}
          </select>
        </div>

        <div className="mb-8">
            <label className="flex items-center justify-between gap-2 cursor-pointer select-none text-sm text-gray-300">
                Diferenciar Maiúsculas/Minúsculas
                <div onClick={() => setIsCaseSensitive(!isCaseSensitive)} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isCaseSensitive ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                    <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${isCaseSensitive ? 'translate-x-5' : ''}`} />
                </div>
            </label>
        </div>
        
        <button onClick={onClose} className="w-full bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors">Fechar</button>
      </div>
    </>
  );
};

export default SettingsModal;