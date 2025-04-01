/* 'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/client'

export async function login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error logging out:', error)
    redirect('/error') // Redirect to an error page if logout fails
  }

  redirect('/login') // Redirect to the login page after successful logout
} */

'use server';

import Cookies from 'js-cookie'; // Move this import to the top of the file
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { data: user, error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    console.error('Login error:', error);
    redirect('/error');
  }

  // Store user data in cookies if needed
  if (user) {
    // Example: You could store user data in cookies using js-cookie
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { data: user, error } = await supabase.auth.signUp(data);

  if (error) {
    console.error('Signup error:', error);
    redirect('/error');
  }

  // Store user data in cookies if needed
  if (user) {
    // Example: You could store user data in cookies using js-cookie
    Cookies.set('user', JSON.stringify(user), { expires: 7 });
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error logging out:', error);
    redirect('/error');
  }

  // Clear cookies when logging out
  Cookies.remove('user');

  redirect('/login');
}
