"use client";

import Editor from "@monaco-editor/react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  language: "python" | "javascript";
}

export function CodeEditor({ value, onChange, language }: Props) {
  return (
    <div className="h-[420px] overflow-hidden rounded-lg border border-edge bg-panel">
      <Editor
        height="100%"
        language={language}
        theme="vs-dark"
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </div>
  );
}
