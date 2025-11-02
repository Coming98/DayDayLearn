'use client';

interface FaceNoteProps {
  notes: string;
}

export function FaceNote({ notes }: FaceNoteProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
          Notes
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-600 to-transparent dark:from-purple-400" />
      </div>
      <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
        {notes}
      </div>
    </div>
  );
}
