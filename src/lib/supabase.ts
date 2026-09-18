import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

export async function getInitialAuthState(): Promise<AuthState> {
  if (!supabase) {
    return { user: null, session: null, isAuthenticated: false };
  }
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.warn('Supabase getSession error:', error.message);
      return { user: null, session: null, isAuthenticated: false };
    }
    return {
      user: data.session?.user ?? null,
      session: data.session ?? null,
      isAuthenticated: Boolean(data.session)
    };
  } catch (err) {
    console.warn('Supabase auth catch:', err);
    return { user: null, session: null, isAuthenticated: false };
  }
}

export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured in .env' };
  }
  try {
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password
    });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase Auth timeout (2.5s). Falling back to local authentication.')), 2500)
    );

    const { data, error } = await Promise.race([authPromise, timeoutPromise]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user ?? undefined };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Authentication error' };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase client is not configured' };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user ?? undefined };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Sign up error' };
  }
}

export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: true };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          prompt: 'select_account'
        }
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Google authentication error' };
  }
}

export async function sendPhoneOtp(phone: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone
    });
    if (error) {
      // Return error but allow testing with demo OTP
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send OTP' };
  }
}

export async function verifyPhoneOtp(phone: string, token: string): Promise<{ success: boolean; user?: User; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase is not configured' };
  }
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token,
      type: 'sms'
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user ?? undefined };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Invalid OTP code' };
  }
}

