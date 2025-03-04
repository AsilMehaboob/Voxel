'use client'

import Script from 'next/script'
import { createClient } from '@/utils/supabase/client'
import { CredentialResponse } from 'google-one-tap'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    google: any;
  }
}

const OneTapComponent = () => {
  const supabase = createClient()
  const router = useRouter()
  const oneTapRef = useRef<HTMLDivElement>(null)

  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    return [nonce, hashedNonce]
  }

  useEffect(() => {
    const initializeGoogleOneTap = async () => {
      console.log('Initializing Google One Tap');
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session', error);
      }
      if (data.session) {
        console.log('User already has a session, redirecting...');
        router.push('/');
        return;
      }

      const [nonce, hashedNonce] = await generateNonce();
      console.log('Nonce: ', nonce, hashedNonce);

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: async (response: CredentialResponse) => {
          try {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
              nonce,
            });

            if (error) throw error;
            console.log('Session data: ', data);
            console.log('Successfully logged in with Google One Tap');

            router.push('/');
          } catch (error) {
            console.error('Error logging in with Google One Tap', error);
          }
        },
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
      });

      // Render the Google sign-in button
      if (oneTapRef.current) {
        window.google.accounts.id.renderButton(
          oneTapRef.current,
          { theme: 'outline', size: 'large', text: 'continue_with' } // Customize the button as needed
        );
      }
    };

    initializeGoogleOneTap();
  }, []);

  return (
    <>
      <Script src="https://accounts.google.com/gsi/client"/>
      <div ref={oneTapRef} id="oneTap" className="w-full flex items-center justify-center" />
    </>
  )
}

export default OneTapComponent