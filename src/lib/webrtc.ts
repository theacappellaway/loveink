
import SimplePeer from 'simple-peer';

interface PeerConnection {
  peer: SimplePeer.Instance;
  isSecure: boolean;
  isCaller: boolean;
}

// Store current connection
let currentConnection: PeerConnection | null = null;

// A basic encryption implementation for signaling
// In a production app, you'd use a more robust encryption library
const encryptSignal = (data: string): string => {
  // Simple XOR encryption with a fixed key (for demo purposes only)
  // In production, use a proper encryption library
  const key = 'DUET_SECURE_TALK_KEY';
  return Array.from(data).map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
};

const decryptSignal = (data: string): string => {
  // Decrypt using the same XOR operation
  return encryptSignal(data); // XOR encryption is symmetric
};

export const createPeer = (
  stream: MediaStream, 
  initiator: boolean,
  onSignal: (signal: string) => void,
  onStream: (stream: MediaStream) => void,
  onConnect: () => void,
  onClose: () => void,
  onError: (err: Error) => void
): void => {
  console.log('Creating peer, initiator:', initiator);
  
  // Close any existing connection
  if (currentConnection) {
    console.log('Closing existing peer connection before creating new one');
    currentConnection.peer.destroy();
    currentConnection = null;
  }

  // Create a new peer connection
  try {
    const peer = new SimplePeer({
      initiator,
      stream,
      trickle: false, // Disable trickle ICE for simplicity
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ]
      }
    });

    console.log('SimplePeer instance created successfully');
    
    currentConnection = {
      peer,
      isSecure: false,
      isCaller: initiator
    };

    peer.on('signal', (data) => {
      console.log('Signal event received from peer:', initiator ? 'initiator' : 'participant');
      // Encrypt the signaling data before sending
      const encryptedSignal = encryptSignal(JSON.stringify(data));
      onSignal(encryptedSignal);
    });

    peer.on('connect', () => {
      console.log('Peer connection established');
      currentConnection!.isSecure = true;
      onConnect();
    });

    peer.on('stream', (remoteStream) => {
      console.log('Remote stream received');
      onStream(remoteStream);
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      currentConnection = null;
      onClose();
    });

    peer.on('error', (err) => {
      console.error('Peer connection error:', err);
      onError(err);
      currentConnection = null;
    });
    
    // Debug ice connection state changes
    peer._pc.addEventListener('iceconnectionstatechange', () => {
      console.log('ICE connection state:', peer._pc.iceConnectionState);
    });
  } catch (error) {
    console.error('Error creating peer:', error);
    onError(error instanceof Error ? error : new Error('Failed to create peer connection'));
  }
};

export const connectToPeer = (signal: string): void => {
  if (!currentConnection) {
    console.error('No active peer connection');
    return;
  }

  try {
    console.log('Connecting to peer with signal data');
    // Decrypt the incoming signal
    const decryptedSignal = decryptSignal(signal);
    const signalData = JSON.parse(decryptedSignal);
    console.log('Signal data parsed successfully, sending to peer');
    currentConnection.peer.signal(signalData);
  } catch (error) {
    console.error('Failed to connect to peer:', error);
  }
};

export const destroyPeer = (): void => {
  if (currentConnection) {
    console.log('Destroying peer connection');
    currentConnection.peer.destroy();
    currentConnection = null;
  }
};

export const isPeerConnected = (): boolean => {
  return currentConnection !== null && currentConnection.peer.connected;
};

export const isPeerSecure = (): boolean => {
  return currentConnection !== null && currentConnection.isSecure;
};

import { nanoid } from 'nanoid';

export const generateRoomId = (): string => {
  // Generate a cryptographically secure room ID
  return nanoid(16);
};

export const getConnectionStatus = (): { connected: boolean; secure: boolean } => {
  return {
    connected: isPeerConnected(),
    secure: isPeerSecure()
  };
};
