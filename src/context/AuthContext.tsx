import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    street?: string;
    city?: string;
    zipCode?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    signup: (data: any) => Promise<boolean>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const convex = useConvex();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const result = await convex.query(api.auth.verifyUser, { email, password });
            if (result) {
                const userSession: User = {
                    id: result.id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    phone: result.phone,
                    street: result.street,
                    city: result.city,
                    zipCode: result.zipCode
                };
                setUser(userSession);
                localStorage.setItem('user', JSON.stringify(userSession));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const signup = async (data: any): Promise<boolean> => {
        try {
            const result = await convex.mutation(api.auth.signupUser, data);
            if (result) {
                // Auto login after signup
                const userSession: User = {
                    id: result.id,
                    firstName: result.firstName,
                    lastName: result.lastName,
                    email: result.email,
                    phone: data.phone,
                    street: result.street,
                    city: result.city,
                    zipCode: result.zipCode
                };
                setUser(userSession);
                localStorage.setItem('user', JSON.stringify(userSession));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUser, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
