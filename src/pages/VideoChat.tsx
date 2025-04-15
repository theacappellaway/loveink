
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoChat } from '@/hooks/useVideoChat';
import VideoDisplay from '@/components/VideoDisplay';
import CallControls from '@/components/CallControls';
import { 
  ShieldCheck, 
  AlertTriangle,
  User
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
    error,
    toggleAudio,
    toggleVideo,
    startCall,
    endCall,
    initializePeer
  } = useVideoChat();

  // Check authorization
  useEffect(() => {
    const authorizedEmail = sessionStorage.getItem('duet_authorized_email');
    if (!authorizedEmail) {
      navigate('/');
    }
  }, [navigate]);

  // Initialize peer connection when necessary
  useEffect(() => {
    if (roomId) {
      initializePeer();
    }
  }, [roomId, localStream, initializePeer]);

  // Redirect if user denies camera/mic permissions
  useEffect(() => {
    if (error) {
      navigate('/');
    }
  }, [error, navigate]);

  // Main video layout - only showing the remote video
  const VideoLayout = () => (
    <div className="flex flex-col w-full h-full max-w-6xl mx-auto p-4">
      {/* Only show remote video */}
      <div className="w-full h-[80vh] relative">
        {remoteStream ? (
          <VideoDisplay
            stream={remoteStream}
            className="w-full h-full rounded-xl shadow-lg"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-xl">
            <div className="text-muted-foreground text-center p-6">
              {isConnected ? "Waiting for other person's camera..." : "Waiting for someone to join..."}
            </div>
          </div>
        )}
        
        {isConnected && (
          <div className="absolute top-3 right-3">
            {isSecure ? (
              <div className="duet-secure-indicator">
                <ShieldCheck className="h-3 w-3" />
                <span>Secure</span>
              </div>
            ) : (
              <div className="duet-warning-indicator">
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
        <Alert className="mt-4 max-w-md">
          <AlertTitle className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Waiting for another person
          </AlertTitle>
          <AlertDescription>
            Share the link with someone to start a secure call. 
            Only two people can join this call.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="flex-1 w-full overflow-hidden">
        <VideoLayout />
      </div>
      <div className="border-t">
        <ControlsSection />
      </div>
    </div>
  );
};

export default VideoChat;
