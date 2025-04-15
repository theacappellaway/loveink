
import React, { useRef, useEffect } from 'react';
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

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={cn(
      "relative rounded-lg overflow-hidden bg-black/5", 
      className
    )}>
      {stream ? (
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
