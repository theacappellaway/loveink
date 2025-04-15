
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
  const connectionAttemptedRef = useRef(false);

  // Check for room ID in URL
  useEffect(() => {
    const roomParam = searchParams.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setIsCaller(false);
      
      // Log that we found a room ID
      console.log('Found room ID in URL:', roomParam);
    } else {
      console.log('No room ID found in URL, user will create a new call');
    }
  }, [searchParams]);

  // Initialize media when component mounts
  useEffect(() => {
    console.log('Initializing media stream');
    mediaStream.initializeMedia();
  }, []);

  // Initialize peer connection
  const initializePeer = useCallback(async () => {
    if (!mediaStream.localStream) {
      console.log('Local stream not available yet, waiting...');
      return;
    }
    
    if (peerInitializedRef.current) {
      console.log('Peer already initialized, skipping');
      return;
    }
    
    console.log('Initializing peer connection, isCaller:', isCaller, 'roomId:', roomId);
    peerInitializedRef.current = true;
    
    // If we're in a room but not the caller, we're waiting for a signal
    if (roomId && !isCaller) {
      console.log('Joining existing room as participant');
      createPeer(
        mediaStream.localStream,
        false, // not initiator
        (signal) => {
          console.log('Participant generated signal data');
          setSignalData(signal);
          toast({
            title: "Connection ready",
            description: "Secure connection established with peer",
          });
        },
        (stream) => {
          console.log('Received remote stream as participant');
          setRemoteStream(stream);
        },
        () => {
          console.log('Participant connected successfully');
          setIsConnected(true);
          setIsSecure(true);
          toast({
            title: "Connected",
            description: "Secure call in progress",
          });
        },
        () => {
          console.log('Participant connection closed');
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
          console.error('Participant connection error:', err);
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
      console.log('Creating new room as initiator');
      const newRoomId = generateRoomId();
      setRoomId(newRoomId);
      setSearchParams({ room: newRoomId });
      
      createPeer(
        mediaStream.localStream,
        true, // initiator
        (signal) => {
          console.log('Initiator generated signal data');
          setSignalData(signal);
          toast({
            title: "Room created",
            description: "Share the link to start a secure call",
          });
        },
        (stream) => {
          console.log('Received remote stream as initiator');
          setRemoteStream(stream);
        },
        () => {
          console.log('Initiator connected successfully');
          setIsConnected(true);
          setIsSecure(true);
          toast({
            title: "Connected",
            description: "Secure call in progress",
          });
        },
        () => {
          console.log('Initiator connection closed');
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
          console.error('Initiator connection error:', err);
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

  // Auto-connect when both users are in same room
  useEffect(() => {
    if (mediaStream.localStream && roomId && signalData && !isConnected && !connectionAttemptedRef.current) {
      console.log('Auto-connecting participant to room...');
      connectionAttemptedRef.current = true;
      
      // Small delay to ensure both peers are ready
      setTimeout(() => {
        if (!isConnected) {
          console.log('Attempting connection with signal data');
          connectToPeer(signalData);
        }
      }, 1000);
    }
  }, [mediaStream.localStream, roomId, signalData, isConnected]);

  // Update connection status periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      const connected = isPeerConnected();
      const secure = isPeerSecure();
      
      if (connected !== isConnected || secure !== isSecure) {
        console.log('Connection status update:', connected, secure);
        setIsConnected(connected);
        setIsSecure(secure);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [isConnected, isSecure]);

  // Create a new call
  const startCall = useCallback(() => {
    console.log('Starting new call as initiator');
    setIsCaller(true);
    connectionAttemptedRef.current = false;
    initializePeer();
  }, [initializePeer]);

  // Connect using a signal from another peer
  const connectWithSignal = useCallback((signal: string) => {
    console.log('Manually connecting with provided signal');
    connectToPeer(signal);
    connectionAttemptedRef.current = true;
  }, []);

  // End the current call
  const endCall = useCallback(() => {
    console.log('Ending call and cleaning up');
    destroyPeer();
    setIsConnected(false);
    setIsSecure(false);
    setRemoteStream(null);
    setRoomId(null);
    setIsCaller(false);
    setSignalData(null);
    peerInitializedRef.current = false;
    connectionAttemptedRef.current = false;
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
