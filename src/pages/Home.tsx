import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Get authorized emails and password from environment variables
const AUTHORIZED_EMAILS = JSON.parse(import.meta.env.VITE_AUTHORIZED_EMAILS || '[]');
const SECRET_PASSWORD = import.meta.env.VITE_SECRET_PASSWORD || '';

const formSchema = z.object({
  email: z.string().email()
    .refine(email => AUTHORIZED_EMAILS.includes(email.toLowerCase()), {
      message: "This email is not authorized"
    }),
  password: z.string().min(1, {
    message: "Password is required"
  }).refine(password => password === SECRET_PASSWORD, {
    message: "Incorrect password"
  })
});

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const startNewCall = (values: z.infer<typeof formSchema>) => {
    // Store the authorized email in sessionStorage
    sessionStorage.setItem('duet_authorized_email', values.email);
    
    // Show success toast
    toast({
      title: "Access granted",
      description: "Starting secure connection...",
      variant: "default",
    });
    
    // Navigate to video chat
    navigate('/video-chat');
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-pink-50 to-rose-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="h-8 w-8 text-white" fill="white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-rose-500 tracking-tight mb-2">
            LoveInk
          </h1>
          <p className="text-rose-400 max-w-md mx-auto">
            Secure private video chat for couples
          </p>
        </div>

        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-pink-400 to-rose-500 w-full"></div>
          <CardHeader className="px-6 pt-5">
            <CardTitle className="flex items-center gap-2 text-rose-500">
              <Lock className="h-5 w-5" />
              Connect Securely
            </CardTitle>
            <CardDescription>
              Enter your credentials to start a private call
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 space-y-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(startNewCall)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-500 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your email" 
                          {...field} 
                          className="border-rose-100 focus-visible:ring-rose-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-rose-500 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Enter the secret password" 
                          {...field} 
                          className="border-rose-100 focus-visible:ring-rose-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-pink-400 to-rose-500 hover:opacity-90 transition-opacity"
                >
                  Start Secure Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>

            <div className="bg-pink-50/50 rounded-lg p-4 mt-4 border border-pink-100">
              <h3 className="font-medium flex items-center gap-2 mb-2 text-rose-500">
                <Heart className="h-4 w-4" fill="currentColor" />
                Private & Secure
              </h3>
              <ul className="space-y-2 text-sm text-rose-400">
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-rose-100 text-rose-500 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                  <span>End-to-end encrypted video calls</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-rose-100 text-rose-500 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                  <span>No data stored or recorded</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="rounded-full bg-rose-100 text-rose-500 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                  <span>Password-protected for only the two of you</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-rose-400">
          <div className="flex items-center justify-center mb-2 gap-1">
            <Lock className="h-3 w-3" />
            <span>End-to-end encrypted</span>
            <span className="mx-2">•</span>
            <Heart className="h-3 w-3" fill="currentColor" />
            <span>Made with love</span>
            <span className="mx-2">•</span>
            <span>Peer-to-peer</span>
          </div>
          <p>© 2025 LoveInk - Your secure connection</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
