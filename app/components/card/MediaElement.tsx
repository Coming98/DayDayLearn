'use client';

import type { MediaAttachment } from '@/types/card';
import { useState } from 'react';

interface MediaElementProps {
  media: MediaAttachment;
}

export function MediaElement({ media }: MediaElementProps) {
  const [error, setError] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load {media.type}
        </p>
        <p className="text-xs text-red-500 dark:text-red-500 mt-1">
          {media.filename}
        </p>
      </div>
    );
  }

  if (media.type === 'image') {
    return (
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <img
          src={media.url}
          alt={media.filename}
          className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          onError={() => setError(true)}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-xs text-white truncate">{media.filename}</p>
          <p className="text-xs text-gray-300">{formatFileSize(media.size)}</p>
        </div>
      </div>
    );
  }

  if (media.type === 'audio') {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎵</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {media.filename}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(media.size)}
            </p>
          </div>
        </div>
        <audio
          controls
          className="w-full"
          onError={() => setError(true)}
        >
          <source src={media.url} type={media.mimeType} />
          Your browser does not support audio playback.
        </audio>
      </div>
    );
  }

  if (media.type === 'video') {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <video
          controls
          className="w-full h-48 bg-black"
          onError={() => setError(true)}
        >
          <source src={media.url} type={media.mimeType} />
          Your browser does not support video playback.
        </video>
        <div className="p-2 bg-gray-50 dark:bg-gray-900/50">
          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{media.filename}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(media.size)}</p>
        </div>
      </div>
    );
  }

  return null;
}
