

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
  showVariablesInFooter: boolean;
  setShowVariablesInFooter: (show: boolean) => void;
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
  showVariablesInFooter,
  setShowVariablesInFooter,
}: SettingsModalProps) => {
  const fonts = ['Inter', 'Montserrat', 'Poppins', 'Arial', 'Verdana'];

  return (
    <>
      {/* Overlay Backdrop Blur */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-all duration-300 z-40 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      />

      {/* Modal Centered Container */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 pointer-events-none transition-all duration-300 ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
          }`}
      >
        {/* Modal Janela */}
        <div
          className="bg-[#1A1B1E] border border-gray-800 rounded-xl shadow-2xl w-full max-w-[340px] overflow-hidden pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#1D1E22]">
            <h2 className="text-base font-semibold text-gray-200 tracking-wide">Preferências</h2>
            <button onClick={onClose} className="p-1 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-5 flex flex-col gap-6">

            <div className="flex flex-col gap-2">
              <label htmlFor="fontSize" className="flex justify-between items-center text-sm font-medium text-gray-400">
                <span>Tamanho da Fonte</span>
                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded text-xs">{fontSize}px</span>
              </label>
              <input
                id="fontSize"
                type="range"
                min="12" max="32" step="1"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="fontFamily" className="text-sm font-medium text-gray-400">Tipo de Fonte</label>
              <div className="relative">
                <select
                  id="fontFamily"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 bg-[#25262B] border border-gray-700 rounded-lg text-gray-200 text-sm focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer transition-colors"
                >
                  {fonts.map((font) => (<option key={font} value={font} style={{ fontFamily: font }}>{font}</option>))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-1">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-300 cursor-pointer select-none" onClick={() => setIsCaseSensitive(!isCaseSensitive)}>
                    Case Sensitive
                  </label>
                  <span className="text-xs text-gray-500 mt-0.5">Diferencia Maiúsculas de Minúsculas</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCaseSensitive(!isCaseSensitive)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out ${isCaseSensitive ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isCaseSensitive ? 'translate-x-2' : '-translate-x-2'}`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-300 cursor-pointer select-none" onClick={() => setShowVariablesInFooter(!showVariablesInFooter)}>
                    Variáveis no Rodapé
                  </label>
                  <span className="text-xs text-gray-500 mt-0.5">Mostra os valores atuais na barra inferior</span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowVariablesInFooter(!showVariablesInFooter)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none transition-colors duration-200 ease-in-out ${showVariablesInFooter ? 'bg-emerald-500' : 'bg-gray-700'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showVariablesInFooter ? 'translate-x-2' : '-translate-x-2'}`}
                  />
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default SettingsModal;