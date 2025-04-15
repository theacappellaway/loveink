
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVideoChat } from '@/hooks/useVideoChat';
import VideoDisplay from '@/components/VideoDisplay';
import CallControls from '@/components/CallControls';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Video as VideoIcon, 
  User,
  AlertTriangle
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

  // Two-person layout
  const VideoLayout = () => (
    <div className="flex flex-col md:flex-row gap-4 w-full h-full max-w-6xl mx-auto p-4">
      {/* Local video - smaller on desktop, full width on mobile */}
      <div className="md:w-1/3 w-full h-[30vh] md:h-auto">
        <VideoDisplay
          stream={localStream}
          isMuted={true}
          isLocal={true}
          className="w-full h-full rounded-xl shadow-lg"
        />
      </div>
      
      {/* Remote video - larger on desktop, full width on mobile */}
      <div className="md:w-2/3 w-full h-[50vh] md:h-auto relative">
        <VideoDisplay
          stream={remoteStream}
          className="w-full h-full rounded-xl shadow-lg"
        />
        
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
