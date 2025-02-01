import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { BaseContent } from '../types';

interface VideoContentProps {
  content: BaseContent;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

export function VideoContent({ content, onProgress, onComplete }: VideoContentProps) {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      const progress = (video.currentTime / video.duration) * 100;
      if (onProgress) {
        onProgress(progress);
      }
      
      // Mark as complete when video is 90% watched
      if (progress > 90 && onComplete) {
        onComplete();
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden ${
      theme === 'dark'
        ? 'bg-gray-900'
        : theme === 'neurodivergent'
        ? 'bg-amber-50'
        : 'bg-gray-100'
    }`}>
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full"
          controls
          playsInline
          poster={content.accessibility?.altText}
        >
          <source src={content.content as string} type="video/mp4" />
          {content.accessibility?.transcripts && (
            Object.entries(content.accessibility.transcripts).map(([lang, url]) => (
              <track 
                key={lang}
                kind="subtitles"
                src={url}
                srcLang={lang}
                label={lang.toUpperCase()}
              />
            ))
          )}
        </video>
        
        {/* Custom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-200"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            {/* Progress Bar */}
            <div className="flex-1 h-1 bg-white/30 rounded-full">
              <div
                className="h-full bg-white rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            
            {/* Time Display */}
            <div className="text-sm text-white">
              {Math.floor(currentTime)}/{Math.floor(duration)}s
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}