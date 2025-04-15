
import React from 'react';
import { 
  Mic, MicOff, 
  Video, VideoOff, 
  PhoneOff, 
  ClipboardCopy, 
  Check,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface CallControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  isConnected: boolean;
  isSecure: boolean;
  roomId: string | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

const CallControls: React.FC<CallControlsProps> = ({
  audioEnabled,
  videoEnabled,
  isConnected,
  isSecure,
  roomId,
  onToggleAudio,
  onToggleVideo,
  onEndCall
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopyInvite = () => {
    if (!roomId) return;
    
    const inviteUrl = `${window.location.origin}?room=${roomId}`;
    navigator.clipboard.writeText(inviteUrl);
    
    setCopied(true);
    toast({
      title: "Invite copied!",
      description: "Share this link with your contact to start a secure call",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="flex items-center gap-2 mb-2">
        {isConnected ? (
          isSecure ? (
            <div className="duet-secure-indicator">
              <ShieldCheck className="h-3 w-3" />
              <span>End-to-end encrypted</span>
            </div>
          ) : (
            <div className="duet-warning-indicator">
              <ShieldAlert className="h-3 w-3" />
              <span>Securing connection...</span>
            </div>
          )
        ) : (
          <div className="duet-warning-indicator">
            <ShieldAlert className="h-3 w-3" />
            <span>Waiting for secure connection</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onToggleAudio}
              size="icon"
              variant="outline"
              className={cn("duet-btn", !audioEnabled && "duet-btn-active")}
            >
              {audioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {audioEnabled ? "Mute microphone" : "Unmute microphone"}
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onToggleVideo}
              size="icon"
              variant="outline"
              className={cn("duet-btn", !videoEnabled && "duet-btn-active")}
            >
              {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {videoEnabled ? "Turn off camera" : "Turn on camera"}
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onEndCall}
              size="icon"
              variant="destructive"
              className="flex items-center justify-center h-10 w-10 rounded-full"
            >
              <PhoneOff className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            End call
          </TooltipContent>
        </Tooltip>
        
        {roomId && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handleCopyInvite}
                size="icon"
                variant="outline"
                className="duet-btn"
              >
                {copied ? <Check className="h-5 w-5" /> : <ClipboardCopy className="h-5 w-5" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Copy invite link
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default CallControls;
