'use client';

interface FaceAProps {
  answer: string;
}

export function FaceA({ answer }: FaceAProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
          Answer
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-green-600 to-transparent dark:from-green-400" />
      </div>
      <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
        {answer}
      </div>
    </div>
  );
}
