import React from 'react';

type SyntaxHighlighterProps = {
  text: string;
  variables: Set<string>;
  isCaseSensitive: boolean;
};

const SyntaxHighlighter = ({ text, variables, isCaseSensitive }: SyntaxHighlighterProps) => {
  // Se não houver variáveis para destacar, retorna o texto simples
  if (variables.size === 0) {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return (
      <>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
          }
          return part;
        })}
      </>
    );
  }

  // Cria a regex para encontrar variáveis, formatação e o resto do texto
  const variableRegex = new RegExp(`\\b(${Array.from(variables).join('|')})\\b`, isCaseSensitive ? 'g' : 'gi');
  const markdownRegex = /(\*\*.*?\*\*|\*.*?\*)/g;
  
  const combinedRegex = new RegExp(`${variableRegex.source}|${markdownRegex.source}`, isCaseSensitive ? 'g' : 'gi');

  const parts = text.split(combinedRegex).filter(Boolean);

  return (
    <>
      {parts.map((part, index) => {
        // Checa por formatação
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={index}>{part.slice(1, -1)}</em>;
        }

        // Checa por variáveis
        const lowerPart = part.toLowerCase();
        const originalVar = Array.from(variables).find(v => v.toLowerCase() === lowerPart);

        if (originalVar) {
          return <span key={index} className="text-emerald-400">{part}</span>;
        }

        // Texto normal
        return part;
      })}
    </>
  );
};

export default SyntaxHighlighter;

