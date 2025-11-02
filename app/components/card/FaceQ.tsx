'use client';

interface FaceQProps {
  question: string;
}

export function FaceQ({ question }: FaceQProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
          Question
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-blue-600 to-transparent dark:from-blue-400" />
      </div>
      <div className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
        {question}
      </div>
    </div>
  );
}
