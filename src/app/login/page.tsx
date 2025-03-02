"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login, signup } from './actions';

export default function LoginPage() {
  const handleLogin = async (formData: FormData) => {
    await login(formData);
  };

  const handleSignup = async (formData: FormData) => {
    await signup(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Please enter your credentials to log in or sign up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form id="loginForm" action={handleLogin}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" required />
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button type="submit" form="loginForm">
            Log in
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const form = document.getElementById('loginForm') as HTMLFormElement;
              const formData = new FormData(form);
              await handleSignup(formData);
            }}
          >
            Sign up
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}