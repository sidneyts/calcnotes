import { ChangeEvent, CSSProperties, useEffect, useMemo, useRef, useState, KeyboardEvent, RefObject } from 'react';
import * as math from 'mathjs';
import convert, { Unit } from 'convert-units';
import * as chrono from 'chrono-node';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import TitleBar from './components/TitleBar';
import SettingsModal, { SettingsIcon } from './components/SettingsModal';
import SyntaxHighlighter from './components/SyntaxHighlighter';
import { ResultEntry, Note } from './types';

// --- Funções Utilitárias para Persistência ---
const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [state, setState] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};


const mathInstance = math.create(math.all);
const mathParser = mathInstance.parser();

// --- Variáveis de Sistema (Moedas e Conectores) ---
// Preenchemos com 1 como padrão temporário e palavras de apoio
const DEFAULT_SYSTEM_VARIABLES: Record<string, number> = {
  em: 1, de: 1, para: 1, hoje: 1,
  Real: 1, Reais: 1, BRL: 1,
  Dolar: 1, Dólar: 1, Dolares: 1, Dólares: 1, Dollar: 1, USD: 1,
  Euro: 1, Euros: 1, EUR: 1,
  Libra: 1, Libras: 1, GBP: 1,
  Peso: 1, Pesos: 1, ARS: 1,
  Bitcoin: 1, Bitcoins: 1, BTC: 1,
};
const SYSTEM_VARIABLE_KEYS = new Set(Object.keys(DEFAULT_SYSTEM_VARIABLES).map(k => k.toLowerCase()));


// --- Componente EditorPanel ---
type EditorPanelProps = {
  input: string;
  handleInputChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  handleKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  editorRef: RefObject<HTMLTextAreaElement>;
  variablesForHighlight: Set<string>;
  fontSize: number;
  fontFamily: string;
  isCaseSensitive: boolean;
  isCalculatorEnabled: boolean;
};

const EditorPanel = ({
  input,
  handleInputChange,
  handleKeyDown,
  editorRef,
  variablesForHighlight,
  fontSize,
  fontFamily,
  isCaseSensitive,
  isCalculatorEnabled,
}: EditorPanelProps) => {
  const editorStyle: CSSProperties = {
    fontFamily: `${fontFamily}, sans-serif`,
    fontSize: `${fontSize}px`,
    lineHeight: '1.5rem',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };

  return (
    <div className="h-full w-full grid grid-cols-1 grid-rows-1">
      <div
        className="col-start-1 row-start-1 py-4 pl-8 pr-6 whitespace-pre-wrap pointer-events-none text-gray-300 select-none overflow-hidden"
        style={editorStyle}
      >
        <SyntaxHighlighter text={input + '\n'} variables={variablesForHighlight} isCaseSensitive={isCaseSensitive} isCalculatorEnabled={isCalculatorEnabled} />
      </div>
      <textarea
        ref={editorRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="col-start-1 row-start-1 py-4 pl-8 pr-6 resize-none bg-transparent text-transparent caret-gray-300 focus:outline-none overflow-y-auto"
        spellCheck="false"
        style={editorStyle}
      />
    </div>
  )
};


// --- Componente Principal da Aplicação ---
function App() {
  const [notes, setNotes] = usePersistentState<Note[]>('sidy-notes', []);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [isNotesMenuOpen, setIsNotesMenuOpen] = useState(false);

  const [results, setResults] = useState<ResultEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [numericResultCount, setNumericResultCount] = useState(0);

  const [isCalculatorEnabled, setIsCalculatorEnabled] = usePersistentState<boolean>('sidy-calc-enabled', true);
  const [fontSize, setFontSize] = usePersistentState<number>('sidy-font-size', 16);
  const [fontFamily, setFontFamily] = usePersistentState<string>('sidy-font-family', 'Inter');
  const [isCaseSensitive, setIsCaseSensitive] = usePersistentState<boolean>('sidy-case-sensitive', true);
  const [showVariablesInFooter, setShowVariablesInFooter] = usePersistentState<boolean>('sidy-show-vars', true);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [variablesForHighlight, setVariablesForHighlight] = useState<Set<string>>(new Set());
  const [calculatedVariables, setCalculatedVariables] = useState<Record<string, string>>({});
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({ ...DEFAULT_SYSTEM_VARIABLES });

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Migration & Initial Load
  useEffect(() => {
    let initialNotes = [...notes];
    
    // Migração: Se não há notas no novo formato, mas há na chave antiga (sidy-content)
    if (initialNotes.length === 0) {
      const oldContentRaw = localStorage.getItem('sidy-content');
      if (oldContentRaw) {
        try {
          const oldContent = JSON.parse(oldContentRaw);
          if (oldContent && typeof oldContent === 'string' && oldContent.trim() !== '') {
            const migratedNote: Note = { id: Date.now().toString(), content: oldContent, updatedAt: Date.now() };
            initialNotes = [migratedNote];
            setNotes(initialNotes);
          }
        } catch (e) {}
      }
    }
    
    if (initialNotes.length > 0) {
      initialNotes.sort((a, b) => b.updatedAt - a.updatedAt);
      if (!currentNoteId) setCurrentNoteId(initialNotes[0].id);
    } else {
      const defaultNote: Note = { id: Date.now().toString(), content: '', updatedAt: Date.now() };
      setNotes([defaultNote]);
      setCurrentNoteId(defaultNote.id);
    }
  }, []);

  const currentNote = notes.find(n => n.id === currentNoteId);
  const input = currentNote ? currentNote.content : '';

  const updateInput = (newText: string) => {
    if (currentNoteId) {
      setNotes(prev => prev.map(n => 
        n.id === currentNoteId ? { ...n, content: newText, updatedAt: Date.now() } : n
      ));
    }
  };

  const { wordCount, charCount } = useMemo(() => {
    const words = input.trim().split(/\s+/).filter(Boolean);
    return {
      wordCount: input.trim() === '' ? 0 : words.length,
      charCount: input.length,
    };
  }, [input]);

  // Listener para abrir as configurações ao receber o evento pelo Tray Menu
  useEffect(() => {
    if (window.electron && window.electron.onOpenSettings) {
      window.electron.onOpenSettings(() => setIsSettingsOpen(true));
    }
  }, []);

  // Busca cotações na inicialização do app
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,GBP-BRL,ARS-BRL,BTC-BRL');
        const data = await response.json();

        setExchangeRates(prev => ({
          ...prev,
          Dolar: Number(data.USDBRL.ask), Dólar: Number(data.USDBRL.ask), Dolares: Number(data.USDBRL.ask), Dólares: Number(data.USDBRL.ask), Dollar: Number(data.USDBRL.ask), USD: Number(data.USDBRL.ask),
          Euro: Number(data.EURBRL.ask), Euros: Number(data.EURBRL.ask), EUR: Number(data.EURBRL.ask),
          Libra: Number(data.GBPBRL.ask), Libras: Number(data.GBPBRL.ask), GBP: Number(data.GBPBRL.ask),
          Peso: Number(data.ARSBRL.ask), Pesos: Number(data.ARSBRL.ask), ARS: Number(data.ARSBRL.ask),
          Bitcoin: Number(data.BTCBRL.ask), Bitcoins: Number(data.BTCBRL.ask), BTC: Number(data.BTCBRL.ask),
        }));
      } catch (e) {
        console.error("Falha ao buscar cotações:", e);
      }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    if (!isCalculatorEnabled) {
      setResults([]); setTotal(0); setNumericResultCount(0); mathParser.clear(); setVariablesForHighlight(new Set()); setCalculatedVariables({}); return;
    }

    const lines = input.split('\n');
    mathParser.clear();

    // Injeta as variáveis de sistema (moedas, conectores) no escopo inicial do mathJs
    Object.entries(exchangeRates).forEach(([key, val]) => {
      mathParser.set(key, val);
      if (!isCaseSensitive) mathParser.set(key.toLowerCase(), val);
    });

    const newResults: ResultEntry[] = [];
    let runningTotal = 0;
    let numericCount = 0;

    // Mapa para busca case-insensitive
    const caseInsensitiveScope = new Map<string, string>();

    lines.forEach(line => {
      let processedLine = line;
      if (line.trim() === '') { newResults.push({ type: 'empty', value: '' }); return; }

      // Lógica de case-insensitive
      if (!isCaseSensitive) {
        // Atualiza o mapa com as variáveis já definidas
        (mathParser as any).scope?.forEach((_: any, key: string) => {
          caseInsensitiveScope.set(key.toLowerCase(), key);
        });

        // Substitui variáveis na linha atual
        processedLine = line.replace(/[a-zA-Zá-úÁ-Ú_][a-zA-Zá-úÁ-Ú0-9_]*/g, (match) => {
          const originalVar = caseInsensitiveScope.get(match.toLowerCase());
          return originalVar || match; // Retorna a variável com a caixa correta ou a original
        });
      }

      const conversionMatch = processedLine.match(/(\d+\.?\d*)\s*([a-zA-Zá-úÁ-Ú]+)\s*(?:in|em)\s*([a-zA-Zá-úÁ-Ú]+)/i);
      if (conversionMatch) {
        const [, value, from, to] = conversionMatch;
        // Se "from" ou "to" for uma moeda conhecida, ignoramos e deixamos pro mathjs
        if (SYSTEM_VARIABLE_KEYS.has(from.toLowerCase()) || SYSTEM_VARIABLE_KEYS.has(to.toLowerCase())) {
          // bypass convert-units
        } else {
          try {
            const result = convert(Number(value)).from(from as Unit).to(to as Unit);
            const formattedResult = mathInstance.format(result, { precision: 14 });
            newResults.push({ type: 'result', value: formattedResult });
            runningTotal += result;
            numericCount++;
            return;
          } catch (e) { /* Ignora se convert-units não achar a unidade correspondente */ }
        }
      }
      // --- Interceptor de Datas em Linguagem Natural ---
      const DATE_MATH_PATTERNS: Array<[RegExp, (q: number) => [number, 'day' | 'week' | 'month' | 'year']]> = [
        [/^(.+?)\s*\+\s*(\d+)\s*(?:dias?|dia)$/i, q => [q, 'day']],
        [/^(.+?)\s*-\s*(\d+)\s*(?:dias?|dia)$/i, q => [-q, 'day']],
        [/^(.+?)\s*\+\s*(\d+)\s*(?:semanas?)$/i, q => [q, 'week']],
        [/^(.+?)\s*-\s*(\d+)\s*(?:semanas?)$/i, q => [-q, 'week']],
        [/^(.+?)\s*\+\s*(\d+)\s*(?:m[eê]ses?|m[eê]s)$/i, q => [q, 'month']],
        [/^(.+?)\s*-\s*(\d+)\s*(?:m[eê]ses?|m[eê]s)$/i, q => [-q, 'month']],
        [/^(.+?)\s*\+\s*(\d+)\s*(?:anos?)$/i, q => [q, 'year']],
        [/^(.+?)\s*-\s*(\d+)\s*(?:anos?)$/i, q => [-q, 'year']],
      ];
      const addToDate = (d: Date, amt: number, unit: 'day' | 'week' | 'month' | 'year') => {
        const r = new Date(d);
        if (unit === 'day') r.setDate(r.getDate() + amt);
        else if (unit === 'week') r.setDate(r.getDate() + amt * 7);
        else if (unit === 'month') r.setMonth(r.getMonth() + amt);
        else if (unit === 'year') r.setFullYear(r.getFullYear() + amt);
        return r;
      };
      const fmtDate = (d: Date) =>
        d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      let dateParsed = false;
      const cleanLine = processedLine.trim();

      // 1. Data + aritmética: "próxima sexta + 2 semanas"
      for (const [pattern, resolver] of DATE_MATH_PATTERNS) {
        const dm = cleanLine.match(pattern);
        if (dm) {
          const parsedRef = chrono.pt.parseDate(dm[1].trim(), new Date(), { forwardDate: true });
          if (parsedRef) {
            const [amt, unit] = resolver(parseInt(dm[2], 10));
            newResults.push({ type: 'result', value: fmtDate(addToDate(parsedRef, amt, unit)) });
            dateParsed = true;
            break;
          }
        }
      }

      // 2. Data simples: "hoje", "amanhã", "próxima sexta"
      if (!dateParsed && /(?:hoje|amanh[ãa]|ontem|pr[oó]xim|semana|segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo|jan|feb|mar|abr|mai|jun|jul|ago|set|out|nov|dez)/i.test(cleanLine)) {
        const simpleDate = chrono.pt.parseDate(cleanLine, new Date(), { forwardDate: true });
        if (simpleDate) {
          newResults.push({ type: 'result', value: fmtDate(simpleDate) });
          dateParsed = true;
        }
      }

      if (dateParsed) return;

      try {
        const result = mathParser.evaluate(processedLine);
        if (result !== undefined && typeof result !== 'function') {
          const formattedResult = mathInstance.format(result, { precision: 14 });
          newResults.push({ type: 'result', value: formattedResult });
          if (typeof result === 'number') {
            runningTotal += result;
            numericCount++;
          }
          else if (result && typeof result.toNumber === 'function') {
            runningTotal += result.toNumber();
            numericCount++;
          }
        } else { newResults.push({ type: 'comment', value: '' }); }
      } catch (e) {
        newResults.push({ type: 'comment', value: '' });
      }
    });

    setResults(newResults);
    setTotal(runningTotal);
    setNumericResultCount(numericCount);
    const currentScope = (mathParser as any).scope;
    if (currentScope && typeof currentScope.keys === 'function') {
      setVariablesForHighlight(new Set(currentScope.keys()));

      const vars: Record<string, string> = {};
      currentScope.forEach((value: any, key: string) => {
        // Oculta variáveis de sistema predefinidas como 'dolar', 'em', 'real' e ignora não-numéricos
        if (SYSTEM_VARIABLE_KEYS.has(key.toLowerCase())) return;

        if (typeof value === 'number') {
          vars[key] = mathInstance.format(value, { precision: 14 });
        } else if (value && typeof value.toNumber === 'function') {
          try {
            vars[key] = mathInstance.format(value.toNumber(), { precision: 14 });
          } catch (e) {
            // ignore non-numeric types like functions
          }
        }
      });
      setCalculatedVariables(vars);
    } else {
      setCalculatedVariables({});
    }
  }, [input, isCalculatorEnabled, isCaseSensitive, exchangeRates]);

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => { updateInput(e.target.value); };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const { selectionStart, selectionEnd } = target;

    const toggleFormatting = (marker: string) => {
      e.preventDefault();
      const value = input;

      if (selectionStart === selectionEnd) return;

      const prefix = value.substring(selectionStart - marker.length, selectionStart);
      const suffix = value.substring(selectionEnd, selectionEnd + marker.length);

      let newText;
      let newSelectionStart = selectionStart;
      let newSelectionEnd = selectionEnd;

      if (prefix === marker && suffix === marker) {
        newText = value.substring(0, selectionStart - marker.length) + value.substring(selectionStart, selectionEnd) + value.substring(selectionEnd + marker.length);
        newSelectionStart -= marker.length;
        newSelectionEnd -= marker.length;
      } else {
        newText = value.substring(0, selectionStart) + marker + value.substring(selectionStart, selectionEnd) + marker + value.substring(selectionEnd);
        newSelectionStart += marker.length;
        newSelectionEnd += marker.length;
      }

      updateInput(newText);

      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(newSelectionStart, newSelectionEnd);
        }
      }, 0);
    };

    if ((e.ctrlKey || e.metaKey) && !isCalculatorEnabled) {
      switch (e.key.toLowerCase()) {
        case 'b':
          toggleFormatting('**');
          break;
        case 'i':
          toggleFormatting('*');
          break;
      }
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      const currentLineStart = input.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = input.substring(currentLineStart, selectionStart);
      const indentationMatch = currentLine.match(/^\s*/);
      const indentation = indentationMatch ? indentationMatch[0] : '';

      const newText =
        input.substring(0, selectionStart) +
        '\n' + indentation +
        input.substring(selectionEnd);

      updateInput(newText);
      const newCursorPos = selectionStart + 1 + indentation.length;

      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          editorRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };

  const appStyle: CSSProperties = { fontFamily: `${fontFamily}, sans-serif` };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1D1E22]" style={appStyle}>
      <TitleBar 
        onCreateNote={() => {
          const newNote: Note = { id: Date.now().toString(), content: '', updatedAt: Date.now() };
          setNotes(prev => [newNote, ...prev]);
          setCurrentNoteId(newNote.id);
          setIsNotesMenuOpen(false);
          setTimeout(() => editorRef.current?.focus(), 0);
        }}
        onToggleMenu={() => setIsNotesMenuOpen(prev => !prev)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        fontSize={fontSize}
        setFontSize={setFontSize}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        isCaseSensitive={isCaseSensitive}
        setIsCaseSensitive={setIsCaseSensitive}
        showVariablesInFooter={showVariablesInFooter}
        setShowVariablesInFooter={setShowVariablesInFooter}
      />

      {/* Drawer do Histórico de Notas */}
      {isNotesMenuOpen && (
        <div className="absolute top-8 right-0 bottom-14 w-64 bg-[#25262B] border-l border-gray-700 shadow-2xl z-50 flex flex-col">
          <div className="p-3 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-gray-300 font-semibold text-sm">Anotações Recentes</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {[...notes].sort((a, b) => b.updatedAt - a.updatedAt).map(note => (
              <div 
                key={note.id} 
                className={`p-3 border-b border-gray-700/50 cursor-pointer hover:bg-gray-700 transition-colors group flex justify-between items-start ${currentNoteId === note.id ? 'bg-gray-700/50' : ''}`}
                onClick={() => {
                  setCurrentNoteId(note.id);
                  setIsNotesMenuOpen(false);
                  setTimeout(() => editorRef.current?.focus(), 0);
                }}
              >
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-gray-300 text-sm truncate">
                    {note.content.trim().split('\n')[0] || 'Nova Anotação...'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(note.updatedAt).toLocaleString()}
                  </p>
                </div>
                <button 
                  className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newNotes = notes.filter(n => n.id !== note.id);
                    setNotes(newNotes);
                    if (currentNoteId === note.id) {
                      if (newNotes.length > 0) {
                        setCurrentNoteId(newNotes.sort((a, b) => b.updatedAt - a.updatedAt)[0].id);
                      } else {
                        const defaultNote: Note = { id: Date.now().toString(), content: '', updatedAt: Date.now() };
                        setNotes([defaultNote]);
                        setCurrentNoteId(defaultNote.id);
                      }
                    }
                  }}
                  title="Excluir nota"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-grow flex relative overflow-hidden">
        {isCalculatorEnabled ? (
          <PanelGroup direction="horizontal">
            <Panel defaultSize={75} minSize={30}>
              <EditorPanel
                input={input}
                handleInputChange={handleInputChange}
                handleKeyDown={handleKeyDown}
                editorRef={editorRef}
                variablesForHighlight={variablesForHighlight}
                fontSize={fontSize}
                fontFamily={fontFamily}
                isCaseSensitive={isCaseSensitive}
                isCalculatorEnabled={isCalculatorEnabled}
              />
            </Panel>
            <PanelResizeHandle className="w-2 flex items-center justify-center bg-transparent group">
              <div className="w-px h-full bg-transparent group-hover:bg-gray-700 transition-colors duration-300"></div>
            </PanelResizeHandle>
            <Panel minSize={20}>
              <div className="h-full overflow-y-auto">
                <div className="p-4">
                  {results.map((result, index) => (<div key={index} className="h-[1.5rem] text-left text-gray-500">{result.type === 'result' ? `= ${result.value}` : ''}</div>))}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        ) : (
          <div className="w-full h-full">
            <EditorPanel
              input={input}
              handleInputChange={handleInputChange}
              handleKeyDown={handleKeyDown}
              editorRef={editorRef}
              variablesForHighlight={variablesForHighlight}
              fontSize={fontSize}
              fontFamily={fontFamily}
              isCaseSensitive={isCaseSensitive}
              isCalculatorEnabled={isCalculatorEnabled}
            />
          </div>
        )}
      </main>

      <footer className="h-14 bg-[#1D1E22] flex items-center justify-between px-4 text-sm gap-4">
        <div className="flex-shrink-0">
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-500">
            <div onClick={() => setIsCalculatorEnabled(!isCalculatorEnabled)} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${isCalculatorEnabled ? 'bg-emerald-500' : 'bg-gray-600'}`}>
              <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-300 ${isCalculatorEnabled ? 'translate-x-5' : ''}`} />
            </div>
            {isCalculatorEnabled ? 'Calculadora' : 'Notas'}
          </label>
        </div>

        <div className="flex-1 text-center text-xs text-gray-500 select-none flex items-center justify-center overflow-hidden">
          {isCalculatorEnabled ? (
            <>
              {showVariablesInFooter && Object.keys(calculatedVariables).length > 0 ? (
                <div className="flex gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide px-2 w-full justify-center">
                  {Object.entries(calculatedVariables).map(([key, value], idx, arr) => (
                    <span key={key} className="flex items-center gap-4 flex-shrink-0">
                      <span>
                        <span className="font-semibold text-gray-400">{key}</span> = {value}
                      </span>
                      {idx < arr.length - 1 && <span className="text-gray-700">|</span>}
                    </span>
                  ))}
                </div>
              ) : numericResultCount > 1 ? (
                <span className="font-semibold">
                  {mathInstance.format(total, { precision: 14 })}
                </span>
              ) : null}
            </>
          ) : (
            <div className="flex items-center justify-center gap-4">
              <span>{charCount} Caracteres</span>
              <span>{wordCount} Palavras</span>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 flex justify-end">
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-700 rounded-full">
            <SettingsIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </footer>
    </div>
  );
}

export default App;

