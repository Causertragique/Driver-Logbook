import { useState, type FormEvent } from 'react';
import { CarFront, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';

type LoginMode = 'login' | 'signup';

export function Login({ onAuthenticate }: { onAuthenticate: (email: string) => void }) {
  const [mode, setMode] = useState<LoginMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onAuthenticate(email);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[hsl(var(--background))] px-4 py-12">
      {/* Background accent */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 size-80 rounded-full bg-[hsl(var(--accent)/.08)] blur-3xl" />
        <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-[hsl(var(--primary)/.08)] blur-3xl" />
      </div>

      {/* Main card */}
      <div className="fade-up w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex size-14 items-center justify-center rounded-[14px] bg-[hsl(var(--accent))] text-[hsl(var(--primary))] shadow-[3px_3px_0_hsl(var(--primary))]">
            <CarFront size={28} strokeWidth={2.3} />
          </div>
          <h1 className="display-font text-2xl font-extrabold text-[hsl(var(--foreground))]">
            Driver<span className="text-[hsl(var(--accent))]">Logbook</span>
          </h1>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Your pocket co-pilot
          </p>
        </div>

        {/* Form container */}
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm md:p-8">
          {/* Tab selector */}
          <div className="mb-6 flex gap-2 rounded-lg bg-[hsl(var(--secondary))] p-1">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                mode === 'login'
                  ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 rounded-md py-2 text-sm font-semibold transition-all ${
                mode === 'signup'
                  ? 'bg-[hsl(var(--background))] text-[hsl(var(--foreground))]'
                  : 'text-[hsl(var(--muted-foreground))]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--foreground))] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 size-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-3 pl-10 pr-4 text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] outline-none transition-colors hover:border-[hsl(var(--muted))] focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent)/.3)]"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-bold text-[hsl(var(--foreground))] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 size-5 text-[hsl(var(--muted-foreground))]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] py-3 pl-10 pr-10 text-sm text-[hsl(var(--foreground))] placeholder-[hsl(var(--muted-foreground))] outline-none transition-colors hover:border-[hsl(var(--muted))] focus:border-[hsl(var(--accent))] focus:ring-1 focus:ring-[hsl(var(--accent)/.3)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="fade-up rounded-lg border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.1)] p-3 text-xs font-medium text-[hsl(var(--destructive))]">
                {error}
              </div>
            )}

            {/* Forgot password link (login only) */}
            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  className="text-xs font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="press group relative w-full overflow-hidden rounded-xl bg-[hsl(var(--primary))] py-3 font-semibold text-[hsl(var(--primary-foreground))] transition-all hover:shadow-lg disabled:opacity-75"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="size-4 animate-spin rounded-full border-2 border-[hsl(var(--primary-foreground)/.3)] border-t-[hsl(var(--primary-foreground))]" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </div>
            </button>

            {/* Terms (signup only) */}
            {mode === 'signup' && (
              <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                By creating an account, you agree to our{' '}
                <button type="button" className="font-semibold text-[hsl(var(--accent))] hover:text-[hsl(var(--foreground))] transition-colors">
                  Terms of Service
                </button>
              </p>
            )}
          </form>
        </div>

        {/* Footer info */}
        <div className="fade-up fade-up-delay-1 text-center">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            <span className="font-semibold text-[hsl(var(--foreground))]">Private by default.</span> Your logs stay on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
