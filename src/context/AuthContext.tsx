import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserProfile, UserRole } from '../types';
import { removePresence } from '../services/shippingService';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  loginDemo: () => void;
  loginAsRole: (role: UserRole, displayName: string, email: string, location?: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen to real Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Petugas Maritim',
          role: 'Super Admin',
          photoURL: firebaseUser.photoURL,
          location: 'Command Center Jakarta',
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    if (!email || !pass) {
      setError('Email/Username dan Password wajib diisi.');
      return false;
    }

    if (pass.length < 6) {
      setError('Password minimal 6 karakter.');
      return false;
    }

    // Role derivation from username/email
    let role: UserRole = 'Super Admin';
    let displayName = 'Administrator Operasional';
    const lower = email.toLowerCase();
    if (lower.includes('fleet') || lower.includes('armada')) {
      role = 'Fleet Manager';
      displayName = 'Manajer Armada Laut';
    } else if (lower.includes('port') || lower.includes('pelabuhan')) {
      role = 'Port Officer';
      displayName = 'Perwira Pelabuhan (Port Officer)';
    } else if (lower.includes('guest') || lower.includes('tamu')) {
      role = 'Guest Officer';
      displayName = 'Pengamat Operasional (Tamu)';
    }

    const uniqueUid = 'usr-' + Math.abs(email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    setUser({
      uid: uniqueUid,
      email: email.trim(),
      displayName,
      role,
      location: 'Pelabuhan Tanjung Priok',
    });
    return true;
  };

  const loginDemo = () => {
    setError(null);
    setUser({
      uid: 'super-admin-wisnu',
      email: 'wisnujepara28@gmail.com',
      displayName: 'Capt. Wisnu, M.Mar (Direktur Operasi)',
      role: 'Super Admin',
      location: 'Kantor Pusat Tanjung Priok',
    });
  };

  const loginAsRole = (role: UserRole, displayName: string, email: string, location?: string) => {
    setError(null);
    const uniqueUid = 'usr-' + role.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(100 + Math.random() * 900);
    setUser({
      uid: uniqueUid,
      email,
      displayName,
      role,
      location: location || 'Pelabuhan Tanjung Perak',
    });
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-in error:', err);
      setError(err?.message || 'Gagal masuk dengan Google.');
    }
  };

  const logout = async () => {
    if (user?.uid) {
      try {
        await removePresence(user.uid);
      } catch (err) {
        console.warn('Logout presence error:', err);
      }
    }
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithEmail,
        loginDemo,
        loginAsRole,
        loginWithGoogle,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
