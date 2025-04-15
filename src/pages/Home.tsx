
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Video, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Define the authorized emails
const AUTHORIZED_EMAILS = [
  'your-email@example.com',  // Replace with your actual email
  'gf-email@example.com'     // Replace with your girlfriend's actual email
];

const formSchema = z.object({
  email: z.string().email()
    .refine(email => AUTHORIZED_EMAILS.includes(email.toLowerCase()), {
      message: "You are not authorized to use this app"
    })
});

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ""
    }
  });

  const startNewCall = (values: z.infer<typeof formSchema>) => {
    // Store the authorized email in sessionStorage
    sessionStorage.setItem('duet_authorized_email', values.email);
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
              Enter your email to verify access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(startNewCall)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full duet-gradient-bg hover:opacity-90 transition-opacity"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Verify & Create Secure Room
                </Button>
              </form>
            </Form>

            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <h3 className="font-medium flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-duet-secure" />
                How it works
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-duet-primary/10 text-duet-primary w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <span>Verify your identity with your email</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-duet-primary/10 text-duet-primary w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <span>Create a secure room with a unique link</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-duet-primary/10 text-duet-primary w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <span>Share the link with your partner</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center mb-2 gap-1">
            <ShieldCheck className="h-3 w-3 text-duet-secure" />
            <span>End-to-end encrypted</span>
            <span className="mx-2">•</span>
            <Lock className="h-3 w-3 text-duet-primary" />
            <span>Peer-to-peer</span>
            <span className="mx-2">•</span>
            <span>Restricted access</span>
          </div>
          <p>Your calls are never stored or recorded</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
