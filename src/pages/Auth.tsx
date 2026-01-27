import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, Lock, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type AuthStep = 'OPTIONS' | 'EMAIL_LOGIN' | 'OTP_VERIFY';

export default function Auth() {
  const { user, isLoading, signInWithGoogle, loginWithPassword, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<AuthStep>('OPTIONS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname;

      // If the user was redirected to auth from a specific page, go back there
      if (from && from !== '/auth') {
        navigate(from, { replace: true });
        // Otherwise, redirect based on role
      } else {
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    }
  }, [user, navigate, location]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await loginWithPassword(email, password);
    setIsSubmitting(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.requireOTP) {
      setStep('OTP_VERIFY');
      toast.info('Please enter the verification code sent to your email.');
    } else {
      toast.success('Signed in successfully!');
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await verifyOTP(email, otp);
    setIsSubmitting(false);

    if (success) {
      toast.success('Account verified!');
    } else {
      toast.error('Invalid or expired code');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="card-elevated p-8 backdrop-blur-sm bg-card/80">
            <AnimatePresence mode="wait">
              {step === 'OPTIONS' && (
                <motion.div
                  key="options"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground text-sm">Choose your preferred login method</p>
                  </div>

                  <div className="space-y-4">
                    <Button
                      onClick={signInWithGoogle}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 hover:bg-muted/50 gap-3 transition-all font-medium"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      Continue with Google
                    </Button>

                    <Button
                      onClick={() => setStep('EMAIL_LOGIN')}
                      variant="outline"
                      className="w-full h-12 rounded-xl border-2 hover:bg-muted/50 gap-3 transition-all font-medium"
                    >
                      <Mail className="w-5 h-5 text-primary" />
                      Sign in with Email
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 'EMAIL_LOGIN' && (
                <motion.div
                  key="email-login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Button variant="ghost" size="sm" onClick={() => setStep('OPTIONS')} className="mb-4 -ml-2 text-muted-foreground">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <h2 className="text-2xl font-bold mb-6">Email Sign In</h2>
                  <form onSubmit={handlePasswordLogin} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="input-field pl-10"
                          placeholder="service@spiritliquor.com.np"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="input-field pl-10"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full btn-gradient-primary h-12 rounded-xl font-bold" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 'OTP_VERIFY' && (
                <motion.div
                  key="otp-verify"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">Verify Identity</h2>
                    <p className="text-sm text-muted-foreground mt-2">
                      We've sent a 6-digit code to <b>{email}</b>
                    </p>
                  </div>
                  <form onSubmit={handleOtpVerify} className="space-y-6">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-center text-4xl tracking-[0.5em] font-mono h-16 rounded-xl border-2 border-primary focus:ring-4 ring-primary/20 outline-none"
                      placeholder="000000"
                    />
                    <Button type="submit" className="w-full btn-gradient-primary h-12 rounded-xl font-bold" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Didn't receive code? <button type="button" onClick={() => setStep('EMAIL_LOGIN')} className="text-primary font-bold hover:underline">Try again</button>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 text-center text-xs text-muted-foreground">
            <p>
              Protected by Daru Hunting Adaptive Security Engine.<br />
              By continuing, you agree to our Security Policy.
            </p>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
