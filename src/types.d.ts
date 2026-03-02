// Declara o módulo para importações de SVG, permitindo que o TypeScript as entenda.
declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

// Declara a interface para a API do Electron que expomos de forma segura no objeto `window`.
export interface IElectronAPI {
  platform: string;
  send: (channel: string, data?: any) => void;
  onOpenSettings: (callback: () => void) => void;
}

// Estende a interface global do `Window` para incluir a nossa API `electron`.
// Isto permite que usemos `window.electron` no nosso código React sem erros de tipo.
declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

// --- Tipos Globais da Aplicação ---
export type ResultType = 'result' | 'comment' | 'error' | 'empty';

export type ResultEntry = {
  type: ResultType;
  value: string;
};
