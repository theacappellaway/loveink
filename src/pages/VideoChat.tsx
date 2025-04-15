
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoChat } from '@/hooks/useVideoChat';
import VideoDisplay from '@/components/VideoDisplay';
import CallControls from '@/components/CallControls';
import { 
  ShieldCheck, 
  AlertTriangle,
  User,
  Heart,
  Code
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const VideoChat: React.FC = () => {
  const navigate = useNavigate();
  const {
    localStream,
    remoteStream,
    audioEnabled,
    videoEnabled,
    isConnected,
    isSecure,
    roomId,
    isCaller,
    signalData,
    error,
    toggleAudio,
    toggleVideo,
    startCall,
    endCall,
    connectWithSignal,
    initializePeer
  } = useVideoChat();
  
  const [manualSignal, setManualSignal] = useState("");
  const [showConnectionCode, setShowConnectionCode] = useState(false);

  // Check authorization
  useEffect(() => {
    const authorizedEmail = sessionStorage.getItem('duet_authorized_email');
    if (!authorizedEmail) {
      navigate('/');
    }
  }, [navigate]);

  // Initialize peer connection when necessary
  useEffect(() => {
    console.log('VideoChat component: localStream available:', !!localStream, 'roomId:', roomId);
    if (localStream && roomId) {
      console.log('Initializing peer connection from VideoChat component');
      initializePeer();
    } else if (localStream && !roomId) {
      console.log('Starting new call since no roomId is available');
      startCall();
    }
  }, [roomId, localStream, initializePeer, startCall]);

  // Handle manual connection code entry
  const handleManualConnect = () => {
    if (manualSignal.trim()) {
      connectWithSignal(manualSignal.trim());
    }
  };

  // Copy connection code to clipboard
  const copyConnectionCode = () => {
    if (signalData) {
      navigator.clipboard.writeText(signalData);
    }
  };

  // Redirect if user denies camera/mic permissions
  useEffect(() => {
    if (error) {
      navigate('/');
    }
  }, [error, navigate]);

  // Main video layout
  const VideoLayout = () => (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto p-4">
      <div className="w-full h-[80vh] relative rounded-xl overflow-hidden border-4 border-pink-200">
        {remoteStream ? (
          <VideoDisplay
            stream={remoteStream}
            className="w-full h-full rounded-xl shadow-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl">
            <div className="text-center p-6">
              <Heart className="h-16 w-16 mx-auto mb-4 text-rose-400" fill="currentColor" />
              <p className="text-xl font-medium text-rose-500">
                {isConnected ? "Waiting for your partner's camera..." : "Waiting for your partner to join..."}
              </p>
              <p className="text-rose-400 mt-2 max-w-md mx-auto">
                Share this link with your partner to start your private conversation
              </p>
              
              {!isConnected && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-rose-200 text-rose-500 hover:bg-rose-50"
                  onClick={() => setShowConnectionCode(!showConnectionCode)}
                >
                  <Code className="mr-2 h-4 w-4" />
                  {showConnectionCode ? "Hide" : "Show"} Connection Code
                </Button>
              )}
              
              {showConnectionCode && signalData && (
                <div className="mt-4 bg-white p-4 rounded-lg border border-rose-200">
                  <p className="text-sm text-rose-500 mb-2">Your connection code:</p>
                  <div className="flex gap-2">
                    <Input 
                      value={signalData} 
                      readOnly 
                      className="text-xs font-mono border-rose-200"
                    />
                    <Button 
                      onClick={copyConnectionCode}
                      variant="secondary"
                      className="bg-rose-100 hover:bg-rose-200 text-rose-600"
                    >
                      Copy
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-rose-500 mb-2">Enter partner's code:</p>
                    <div className="flex gap-2">
                      <Textarea 
                        value={manualSignal}
                        onChange={(e) => setManualSignal(e.target.value)}
                        placeholder="Paste your partner's connection code here"
                        className="text-xs font-mono h-20 border-rose-200"
                      />
                    </div>
                    <Button 
                      onClick={handleManualConnect}
                      className="mt-2 w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:opacity-90"
                    >
                      Connect Manually
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {isConnected && (
          <div className="absolute top-3 right-3">
            {isSecure ? (
              <div className="inline-flex items-center gap-1 text-xs font-medium py-1 px-2 rounded bg-green-500/10 text-green-500 animate-pulse">
                <ShieldCheck className="h-3 w-3" />
                <span>Secure</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-xs font-medium py-1 px-2 rounded bg-amber-500/10 text-amber-500">
                <AlertTriangle className="h-3 w-3" />
                <span>Securing...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Controls and info section
  const ControlsSection = () => (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <CallControls
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        isConnected={isConnected}
        isSecure={isSecure}
        roomId={roomId}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onEndCall={() => {
          endCall();
          navigate('/');
        }}
      />
      
      {!isConnected && roomId && (
        <Alert className="mt-4 max-w-md border-pink-200 bg-pink-50">
          <AlertTitle className="flex items-center gap-2 text-rose-500">
            <User className="h-4 w-4" />
            Waiting for your partner
          </AlertTitle>
          <AlertDescription className="text-rose-400">
            Share the link with your partner to start a secure call. 
            Only two people can join this call.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full justify-between bg-gradient-to-b from-pink-50 to-rose-50">
      <div className="flex-1 w-full overflow-hidden">
        <VideoLayout />
      </div>
      <div className="border-t border-pink-200">
        <ControlsSection />
      </div>
    </div>
  );
};

export default VideoChat;
