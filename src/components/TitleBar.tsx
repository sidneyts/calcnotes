import { CSSProperties } from 'react';

type TitleBarProps = {
  onCreateNote: () => void;
  onToggleMenu: () => void;
};

// --- Componente da Barra de Título ---
// Refatorado para garantir que toda a barra seja arrastável, exceto os botões.
const TitleBar = ({ onCreateNote, onToggleMenu }: TitleBarProps) => (
  <div
    className="relative flex items-center justify-center h-8 bg-[#1D1E22] text-white select-none"
    style={{ WebkitAppRegion: 'drag' } as CSSProperties}
  >
    {/* Título centralizado com opacidade reduzida */}
    <span className="text-sm font-semibold text-gray-500">
      Sidy
    </span>

    <div className="absolute right-0 top-0 h-full flex items-center" style={{ WebkitAppRegion: 'no-drag' } as CSSProperties}>
      {/* Botões do Histórico de Notas e Nova Nota */}
      <button onClick={onCreateNote} className="px-3 h-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200" title="Nova Nota">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      <button onClick={onToggleMenu} className="px-3 h-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200 mr-2" title="Histórico de Notas">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>

      {/* Contêiner dos botões de janela (Apenas para Windows/Linux) */}
      {window.electron?.platform !== 'darwin' && (
        <>
          <button onClick={() => window.electron.send('minimize-window')} className="px-4 h-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200">
            <svg width="10" height="10" viewBox="0 0 10 1"><path d="M0,0 H10 V1 H0 Z" fill="currentColor" /></svg>
          </button>
          <button onClick={() => window.electron.send('maximize-window')} className="px-4 h-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors duration-200">
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0,0 H10 V10 H0 Z M1,1 V9 H9 V1 Z" fill="currentColor" /></svg>
          </button>
          <button onClick={() => window.electron.send('close-window')} className="px-4 h-full text-gray-400 hover:bg-red-600 hover:text-white transition-colors duration-200">
            <svg width="10" height="10" viewBox="0 0 10 10"><path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </>
      )}
    </div>
  </div>
);

export default TitleBar;

