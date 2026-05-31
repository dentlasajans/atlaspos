import React, { useState, useEffect } from 'react';
import { SuperAdminLogin } from './SuperAdminLogin';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Loader2 } from 'lucide-react';

export const SuperAdminApp: React.FC = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Anonymously signed-in users for regular POS shouldn't block, but for super admin we expect an email.
            if (currentUser && currentUser.email) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <SuperAdminLogin onLogin={() => {}} />;
    }

    return <SuperAdminDashboard />;
};
