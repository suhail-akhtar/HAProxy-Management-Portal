
import React, { useState, useRef, useEffect } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, readOnly = false }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = value.split('\n').length;
    setLineCount(lines);
  }, [value]);

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="relative flex h-full border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden font-mono text-sm bg-slate-50 dark:bg-slate-900">
      <div
        ref={lineNumbersRef}
        className="hidden md:block w-12 flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-400 text-right p-2 select-none overflow-hidden leading-6"
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i + 1}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        readOnly={readOnly}
        className="flex-1 w-full h-full p-2 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-6 whitespace-pre"
        spellCheck={false}
      />
    </div>
  );
};
