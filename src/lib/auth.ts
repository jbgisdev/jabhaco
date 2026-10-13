import type { AuthUser } from '../types/database.types';
import { getSupabaseClient } from './supabase';

const AUTH_STORAGE_KEY = 'jabhaco_auth_session';

// Credenciales oficiales de Administrador de Jabhaco Lab
export const ADMIN_CREDENTIALS = {
  email: 'admin@jabha.co',
  password: 'admin123*',
  user: {
    id: 'admin-001',
    email: 'admin@jabha.co',
    nombre: 'Administrador Jabhaco',
    rol: 'admin' as const,
  },
};

/**
 * Obtiene el usuario autenticado actual desde el almacenamiento local o sesión
 */
export function getCurrentUser(): AuthUser | null {
  const sessionStr = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!sessionStr) return null;
  try {
    return JSON.parse(sessionStr) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

/**
 * Guarda la sesión del usuario en localStorage
 */
export function saveSession(user: AuthUser): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

/**
 * Limpia la sesión del usuario
 */
export async function logout(): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Error al cerrar sesión en Supabase:', err);
    }
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
}


/**
 * Registra un nuevo usuario en Supabase Auth.
 * Conexión directa y estricta con la base de datos de Supabase.
 */
export async function register(
  nombreInput: string,
  emailInput: string,
  passwordInput: string
): Promise<{ user: AuthUser; error: string | null; message?: string }> {
  const nombre = nombreInput.trim();
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!nombre) {
    return { user: null as any, error: 'Por favor ingresa tu nombre o nombre de tu emprendimiento.' };
  }
  if (!email || !email.includes('@')) {
    return { user: null as any, error: 'Por favor ingresa un correo electrónico válido.' };
  }
  if (!password || password.length < 6) {
    return { user: null as any, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null as any,
      error: 'No se detectaron las credenciales de Supabase en .env. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          rol: 'usuario',
        },
      },
    });

    if (error) {
      return {
        user: null as any,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        user: null as any,
        error: 'No se pudo crear el usuario en Supabase.',
      };
    }

    const newAuthUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      nombre,
      rol: 'usuario',
      created_at: data.user.created_at,
    };

    saveSession(newAuthUser);

    return {
      user: newAuthUser,
      error: null,
      message: '¡Usuario registrado exitosamente en la base de datos Supabase!',
    };
  } catch (err: any) {
    return {
      user: null as any,
      error: err.message || 'Error de conexión con Supabase.',
    };
  }
}

/**
 * Inicia sesión directamente con Supabase Auth.
 */
export async function login(
  emailInput: string,
  passwordInput: string
): Promise<{ user: AuthUser; error: string | null }> {
  const email = emailInput.trim().toLowerCase();
  const password = passwordInput.trim();

  if (!email || !password) {
    return { user: null as any, error: 'Por favor ingresa tu correo y contraseña.' };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null as any,
      error: 'Supabase no está configurado en .env.',
    };
  }

  const isMasterAdmin =
    email === ADMIN_CREDENTIALS.email.toLowerCase() &&
    password === ADMIN_CREDENTIALS.password;

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Si es el admin maestro y aún no existe en Supabase, registrarlo directamente
      if (isMasterAdmin) {
        const { data: adminRegData, error: adminRegErr } = await client.auth.signUp({
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password,
          options: {
            data: {
              nombre: 'Administrador Jabhaco',
              rol: 'admin',
            },
          },
        });

        if (!adminRegErr && adminRegData.user) {
          const masterUser: AuthUser = {
            id: adminRegData.user.id,
            email: ADMIN_CREDENTIALS.email,
            nombre: 'Administrador Jabhaco',
            rol: 'admin',
            created_at: adminRegData.user.created_at,
          };
          saveSession(masterUser);
          return { user: masterUser, error: null };
        }
      }

      return {
        user: null as any,
        error:
          error.message === 'Invalid login credentials'
            ? 'Credenciales incorrectas en Supabase. Verifica tu correo y contraseña.'
            : error.message,
      };
    }

    if (!data.user) {
      return {
        user: null as any,
        error: 'No se pudo obtener la sesión de Supabase.',
      };
    }

    const authUser: AuthUser = {
      id: data.user.id,
      email: data.user.email || email,
      nombre:
        data.user.user_metadata?.nombre ||
        (email === ADMIN_CREDENTIALS.email ? 'Administrador Jabhaco' : email.split('@')[0]),
      rol: (data.user.user_metadata?.rol as 'admin' | 'usuario') || (isMasterAdmin ? 'admin' : 'usuario'),
      created_at: data.user.created_at,
    };

    saveSession(authUser);
    return { user: authUser, error: null };
  } catch (err: any) {
    return {
      user: null as any,
      error: err.message || 'Error de conexión con Supabase.',
    };
  }
}


