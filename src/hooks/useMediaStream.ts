
import { useState, useEffect, useCallback } from 'react';

interface MediaStreamState {
  localStream: MediaStream | null;
  error: Error | null;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export const useMediaStream = () => {
  const [state, setState] = useState<MediaStreamState>({
    localStream: null,
    error: null,
    audioEnabled: true,
    videoEnabled: true
  });

  const initializeMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: true 
      });
      
      setState(prev => ({
        ...prev,
        localStream: stream,
        error: null
      }));
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error : new Error('Failed to access media devices'),
        // If we can't get video/audio, mark them as disabled
        audioEnabled: false,
        videoEnabled: false
      }));
      return null;
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (!state.localStream) return;
    
    const audioTracks = state.localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });
    
    setState(prev => ({
      ...prev,
      audioEnabled: !prev.audioEnabled
    }));
  }, [state.localStream]);

  const toggleVideo = useCallback(() => {
    if (!state.localStream) return;
    
    const videoTracks = state.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });
    
    setState(prev => ({
      ...prev,
      videoEnabled: !prev.videoEnabled
    }));
  }, [state.localStream]);

  const stopMediaStream = useCallback(() => {
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
      setState(prev => ({
        ...prev,
        localStream: null
      }));
    }
  }, [state.localStream]);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, [stopMediaStream]);

  return {
    ...state,
    initializeMedia,
    toggleAudio,
    toggleVideo,
    stopMediaStream
  };
};
