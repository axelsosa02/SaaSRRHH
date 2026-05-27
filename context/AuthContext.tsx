"use client"

import { getUser } from '@/actions/auth/getUser';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/types/database';
import { createContext, useContext, useEffect, useState } from 'react';

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    getUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getUserData = async () => {
        try {
            const userData = await getUser();
            if (userData) {
                setUser(userData);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const authState = async () => {
        const supabase = createClient()
        supabase.auth.onAuthStateChange((event, session) => {

            const eventType = [
                'INITIAL_SESSION',
                'SIGN_IN',
                'SIGN_OUT',
                'TOKEN_REFRESHED',
                'USER_UPDATED'
            ]

            if (eventType.includes(event)) {
                if (session) {
                    getUserData()
                } else {
                    setUser(null)
                }
            }
        })
    }

    useEffect(() => {
        authState()
    }, []);

    return (
        <AuthContext.Provider value={{ user, isLoading, getUserData }}>
            {children}
        </AuthContext.Provider>
    )

}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};
