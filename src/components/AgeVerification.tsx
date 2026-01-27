import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AGE_VERIFIED_KEY = 'selfdrop-age-verified';

export function AgeVerification() {
  const [showModal, setShowModal] = useState(false);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const isVerified = localStorage.getItem(AGE_VERIFIED_KEY);
    if (!isVerified) {
      setShowModal(true);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleVerify = () => {
    localStorage.setItem(AGE_VERIFIED_KEY, 'true');
    setShowModal(false);
    document.body.style.overflow = '';
  };

  const handleDeny = () => {
    setDenied(true);
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border overflow-hidden"
        >
          {!denied ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-center text-primary-foreground">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 overflow-hidden">
                  <img src="/logo.png" className="w-full h-full object-cover" alt="Daru Hunting" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Daru Hunting
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-[10px] font-bold tracking-widest uppercase mb-4">
                  <ShieldCheck className="w-3 h-3" />
                  Age Verification required
                </div>
                <p className="text-primary-foreground/80 text-sm">
                  The hunt for elite spirits is for adults only.
                </p>
              </div>

              {/* Content */}
              <div className="p-8">
                <p className="text-center text-muted-foreground mb-6">
                  You must be <span className="font-bold text-foreground">21 years or older</span> to enter this site.
                  By clicking "I am 21+" you confirm that you are of legal age to purchase alcohol and tobacco products.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleVerify}
                    className="w-full h-14 btn-gradient-primary text-lg rounded-xl"
                  >
                    I am 21 or older
                  </Button>
                  <Button
                    onClick={handleDeny}
                    variant="outline"
                    className="w-full h-12 rounded-xl border-2"
                  >
                    I am under 21
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-6">
                  By entering this site, you agree to our Terms of Service and acknowledge our Privacy Policy.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Denied State */}
              <div className="p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Access Denied
                </h2>
                <p className="text-muted-foreground mb-6">
                  Sorry, you must be 21 years or older to access this website.
                  Please visit us again when you meet the age requirement.
                </p>
                <Button
                  onClick={() => setDenied(false)}
                  variant="outline"
                  className="rounded-xl"
                >
                  Go Back
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
