
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Video, Lock } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const startNewCall = () => {
    navigate('/video-chat');
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-duet-tertiary tracking-tight mb-2">
            Duet Secure Talk
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            End-to-end encrypted video chat for two people
          </p>
        </div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-duet w-full"></div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-duet-primary" />
              Start a secure call
            </CardTitle>
            <CardDescription>
              Create a private video chat with end-to-end encryption
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-duet-secure" />
                How it works
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-duet-primary/10 text-duet-primary w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <span>Create a secure room with a unique link</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-duet-primary/10 text-duet-primary w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <span>Share the link with exactly one other person</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-duet-primary/10 text-duet-primary w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <span>Enjoy a private, encrypted video conversation</span>
                </li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={startNewCall} 
              className="w-full duet-gradient-bg hover:opacity-90 transition-opacity"
            >
              <Lock className="mr-2 h-4 w-4" />
              Create Secure Room
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center mb-2 gap-1">
            <ShieldCheck className="h-3 w-3 text-duet-secure" />
            <span>End-to-end encrypted</span>
            <span className="mx-2">•</span>
            <Lock className="h-3 w-3 text-duet-primary" />
            <span>Peer-to-peer</span>
            <span className="mx-2">•</span>
            <span>Two-person limit</span>
          </div>
          <p>Your calls are never stored or recorded</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
