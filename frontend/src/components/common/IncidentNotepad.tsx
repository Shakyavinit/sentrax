import React, { useState, useEffect, useRef } from 'react';
import { FileText, X, Plus, Download, Trash2, Clock } from 'lucide-react';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  context?: string;
}

const STORAGE_KEY = 'sentrax_incident_notes';

function loadNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

interface IncidentNotepadProps {
  contextInfo?: string;
}

export const IncidentNotepad: React.FC<IncidentNotepadProps> = ({ contextInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setNotes(loadNotes());
  }, []);

  const addNote = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const newNote: Note = {
      id: Date.now().toString(),
      text: trimmed,
      timestamp: new Date().toLocaleString(),
      context: contextInfo,
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setInputText('');
    textareaRef.current?.focus();
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotes(updated);
  };

  const exportNotes = () => {
    const text = notes
      .map((n) => `[${n.timestamp}]${n.context ? ` [${n.context}]` : ''}\n${n.text}`)
      .join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sentrax_incident_notes_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (window.confirm('Clear all incident notes? This cannot be undone.')) {
      setNotes([]);
      saveNotes([]);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-5 right-5 z-40 flex items-center gap-2 px-3 py-2 rounded-full shadow-2xl transition text-xs font-mono font-bold ${
          isOpen
            ? 'bg-[#121B29] border border-blue-500/60 text-blue-400'
            : 'bg-[#0E1520] border border-slate-700/60 text-slate-300 hover:border-blue-500/50 hover:text-blue-400'
        }`}
        title="Incident Notepad"
      >
        <FileText className="w-4 h-4" />
        <span>NOTES</span>
        {notes.length > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-bold">
            {notes.length}
          </span>
        )}
      </button>

      {/* Notepad Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-5 z-40 w-80 bg-[#0D1522] border border-slate-700/60 rounded-xl shadow-2xl flex flex-col max-h-[70vh] overflow-hidden">
          {/* Header */}
          <div className="px-3 py-2.5 border-b border-slate-700/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-mono font-bold text-slate-200">INCIDENT NOTEPAD</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={exportNotes}
                title="Export notes"
                className="p-1 text-slate-400 hover:text-emerald-400 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={clearAll}
                title="Clear all"
                className="p-1 text-slate-400 hover:text-red-400 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Context chip */}
          {contextInfo && (
            <div className="px-3 py-1.5 bg-blue-950/20 border-b border-blue-800/30 text-[10px] font-mono text-blue-300 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span className="truncate">{contextInfo}</span>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-b border-slate-700/40 shrink-0">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote();
              }}
              placeholder="Type incident note... (Ctrl+Enter to add)"
              rows={3}
              className="w-full bg-[#0B0F18] border border-slate-700/60 text-slate-200 text-xs font-mono rounded px-3 py-2 resize-none focus:outline-none focus:border-blue-500 placeholder-slate-600"
            />
            <button
              onClick={addNote}
              disabled={!inputText.trim()}
              className="mt-2 w-full py-1.5 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Note
            </button>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {notes.length === 0 ? (
              <div className="text-center text-slate-600 font-mono text-[11px] py-6">
                No notes yet. Start typing above.
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-[#0B0F18] rounded border border-slate-800 p-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs text-slate-200 leading-relaxed flex-1 whitespace-pre-wrap">
                      {note.text}
                    </p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-slate-600 hover:text-red-400 transition p-0.5 shrink-0 opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500">{note.timestamp}</span>
                    {note.context && (
                      <span className="text-[9px] font-mono text-blue-500 truncate max-w-[140px]">
                        {note.context}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};
