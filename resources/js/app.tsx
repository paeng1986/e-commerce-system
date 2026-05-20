import { createInertiaApp } from '@inertiajs/react';
import { ToastProvider } from './context/ToastContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const cloudId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
    withApp(app) {
        return <GoogleOAuthProvider clientId={cloudId}>
                <ToastProvider> {app} </ToastProvider>
            </GoogleOAuthProvider>
        
    }
});
