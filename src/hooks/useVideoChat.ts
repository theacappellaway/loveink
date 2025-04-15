
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMediaStream } from './useMediaStream';
import { 
  createPeer, 
  connectToPeer, 
  destroyPeer, 
  isPeerConnected,
  isPeerSecure,
  generateRoomId
} from '@/lib/webrtc';
import { useToast } from '@/hooks/use-toast';

export const useVideoChat = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const mediaStream = useMediaStream();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSecure, setIsSecure] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState(false);
  const [signalData, setSignalData] = useState<string | null>(null);
  const peerInitializedRef = useRef(false);

  // Check for room ID in URL
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setIsCaller(false);
    }
  }, [searchParams]);

  // Initialize media when component mounts
  useEffect(() => {
    mediaStream.initializeMedia();
  }, []);

  // Initialize peer connection
  const initializePeer = useCallback(async () => {
    if (peerInitializedRef.current || !mediaStream.localStream) return;
    
    peerInitializedRef.current = true;
    
    // If we're in a room but not the caller, we're waiting for a signal
    if (roomId && !isCaller) {
      createPeer(
        mediaStream.localStream,
        false, // not initiator
        (signal) => {
          setSignalData(signal);
          toast({
            title: "Connection ready",
            description: "Secure connection established with peer",
          });
        },
        (stream) => {
          setRemoteStream(stream);
        },
        () => {
          setIsConnected(true);
          setIsSecure(true);
          toast({
            title: "Connected",
            description: "Secure call in progress",
          });
        },
        () => {
          setIsConnected(false);
          setIsSecure(false);
          setRemoteStream(null);
          peerInitializedRef.current = false;
          toast({
            title: "Call ended",
            description: "The connection was closed",
            variant: "destructive",
          });
        },
        (err) => {
          toast({
            title: "Connection error",
            description: err.message,
            variant: "destructive",
          });
          peerInitializedRef.current = false;
        }
      );
    }
    // If we're creating a new call
    else if (isCaller) {
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setSearchParams({ room: newRoomId });
      
      createPeer(
        mediaStream.localStream,
        true, // initiator
        (signal) => {
          setSignalData(signal);
          toast({
            title: "Room created",
            description: "Share the link to start a secure call",
          });
        },
        (stream) => {
          setRemoteStream(stream);
        },
        () => {
          setIsConnected(true);
          setIsSecure(true);
          toast({
            title: "Connected",
            description: "Secure call in progress",
          });
        },
        () => {
          setIsConnected(false);
          setIsSecure(false);
          setRemoteStream(null);
          peerInitializedRef.current = false;
          toast({
            title: "Call ended",
            description: "The connection was closed",
            variant: "destructive",
          });
        },
        (err) => {
          toast({
            title: "Connection error",
            description: err.message,
            variant: "destructive",
          });
          peerInitializedRef.current = false;
        }
      );
    }
  }, [mediaStream.localStream, roomId, isCaller, setSearchParams, toast]);

  // Update connection status periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsConnected(isPeerConnected());
      setIsSecure(isPeerSecure());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Create a new call
  const startCall = useCallback(() => {
    setIsCaller(true);
    initializePeer();
  }, [initializePeer]);

  // Connect using a signal from another peer
  const connectWithSignal = useCallback((signal: string) => {
    connectToPeer(signal);
  }, []);

  // End the current call
  const endCall = useCallback(() => {
    destroyPeer();
    setIsConnected(false);
    setIsSecure(false);
    setRemoteStream(null);
    setRoomId(null);
    setIsCaller(false);
    setSignalData(null);
    peerInitializedRef.current = false;
    setSearchParams({});
  }, [setSearchParams]);

  return {
    localStream: mediaStream.localStream,
    remoteStream,
    audioEnabled: mediaStream.audioEnabled,
    videoEnabled: mediaStream.videoEnabled,
    isConnected,
    isSecure,
    roomId,
    isCaller,
    signalData,
    error: mediaStream.error,
    toggleAudio: mediaStream.toggleAudio,
    toggleVideo: mediaStream.toggleVideo,
    startCall,
    connectWithSignal,
    endCall,
    initializePeer
  };
};
