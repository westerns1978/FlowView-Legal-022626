
import { useState, useCallback } from 'react';

const SESSION_KEY = 'flowview_secure_session';

interface User {
    name: string;
}

export const usePersistentSession = () => {
    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') return null;
        // Migration cleanup: remove old localStorage session keys if they exist
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem('flowview-active-view');

        const saved = sessionStorage.getItem(SESSION_KEY);
        if (!saved) return null;
        try {
            return JSON.parse(saved) as User;
        } catch (e) {
            return null;
        }
    });

    const isAuthenticated = !!user;

    const login = useCallback((userToLogin: User) => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userToLogin));
        setUser(userToLogin);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem('flowview-active-view');
        setUser(null);
    }, []);

    return { isAuthenticated, user, login, logout };
};
