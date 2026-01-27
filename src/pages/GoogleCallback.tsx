import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * GoogleCallback Component
 * 
 * This component handles the redirection from Google after a user authorizes
 * the application via the OAuth 2.0 Authorization Code flow.
 * 
 * Responsibilities:
 * 1. Extract the 'code' (authorization code) or 'error' from the URL parameters.
 * 2. Handle Google-side errors (e.g., user cancelled authorization).
 * 3. Exchange the authorization code for a JWT via the backend API.
 * 4. Manage user redirection and toast notifications based on the result.
 */
export default function GoogleCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { authenticate } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            // Check for error parameters returned from Google
            const error = searchParams.get('error');
            if (error) {
                const errorDescription = searchParams.get('error_description') || 'Unknown error';
                console.error('Google OAuth Error:', error, errorDescription);
                toast.error(`Google Sign-In Failed: ${errorDescription}`);
                navigate('/auth');
                return;
            }

            // Extract the authorization code
            const code = searchParams.get('code');
            if (!code) {
                console.error('No authorization code found in URL parameters.');
                toast.error('Authentication failed: Missing authorization code.');
                navigate('/auth');
                return;
            }

            try {
                // Attempt to authenticate with the backend using the authorization code
                // The authenticate function in AuthContext handles the API call and state updates
                const success = await authenticate(code);

                if (success) {
                    toast.success('Successfully signed in with Google');
                    // Redirect to home page on successful login
                    navigate('/');
                } else {
                    toast.error('Failed to sign in with Google');
                    navigate('/auth');
                }
            } catch (error) {
                console.error('Unexpected error during Google callback processing:', error);
                toast.error('An error occurred while completing your sign-in.');
                navigate('/auth');
            }
        };

        handleCallback();
    }, [searchParams, navigate, authenticate]);

    /**
     * Intermediate Loading State
     * 
     * Show a spinner while the authorization code is being exchanged.
     * This provides feedback to the user that the process is ongoing.
     */
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    );
}
