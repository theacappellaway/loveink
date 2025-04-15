
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface VideoDisplayProps {
  stream: MediaStream | null;
  isMuted?: boolean;
  isLocal?: boolean;
  className?: string;
}

const VideoDisplay = ({ 
  stream, 
  isMuted = false, 
  isLocal = false,
  className 
}: VideoDisplayProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      try {
        videoRef.current.srcObject = stream;
        
        // Add error handling for video element
        const handleVideoError = (e: Event) => {
          console.error('Video error:', e);
          setError('Failed to display video stream');
        };
        
        videoRef.current.addEventListener('error', handleVideoError);
        
        return () => {
          if (videoRef.current) {
            videoRef.current.removeEventListener('error', handleVideoError);
          }
        };
      } catch (err) {
        console.error('Error setting video stream:', err);
        setError(err instanceof Error ? err.message : 'Unknown video error');
      }
    }
  }, [stream]);

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden bg-black/5", 
      className
    )}>
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-duet-dark/10">
          <div className="text-destructive text-sm">Error: {error}</div>
        </div>
      ) : stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className={cn(
            "w-full h-full object-cover",
            isLocal && "transform scale-x-[-1]" // Mirror local video
          )}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-duet-dark/10">
          <div className="text-muted-foreground">
            {isLocal ? "Camera off" : "Waiting for connection..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoDisplay;
