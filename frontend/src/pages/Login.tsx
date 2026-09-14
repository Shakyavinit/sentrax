import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { Lock, User as UserIcon, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { DEMO_MODE } from '../utils/demo';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await authApi.login({ username, password });
      setAuth(res.user, res.access_token);
      toast.success(`Welcome back, Officer ${res.user.username}`);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Unable to sign in. Check your credentials and server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#080C12] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Subtle Dot Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#1C2E42 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="w-full max-w-[480px] bg-[#0D1520] border border-[#233A52] rounded-[8px] p-8 shadow-[0_24px_48px_rgba(0,0,0,0.8)] relative z-10">
        {/* Top Header */}
        <div className="text-center pt-2 pb-6">
          <div className="flex justify-center mb-2">
            <Logo className="h-9" />
          </div>
          <p className="text-xs text-[#8FA8C0] tracking-wide">
            CipherNetra Intelligence & Digital Forensics Platform
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3 rounded-[4px] bg-[rgba(255,59,59,0.12)] border border-[rgba(255,59,59,0.3)] text-[#FF3B3B] text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        {DEMO_MODE ? <div className="space-y-5">
          <h1 className="text-2xl font-semibold">Investigate the connections.</h1>
          <p className="text-sm text-[#8FA8C0] leading-relaxed">Explore vehicle search, camera sightings, watchlist review and evidence preservation in a guided sample environment.</p>
          <div className="demo-notice">Demo workspace · Fictional records and prerecorded footage. No police systems or live cameras connected.</div>
          <Button className="w-full" size="lg" onClick={() => {
            setAuth({ id: 'demo-officer', username: 'Demo Officer', email: '', role: 'admin', is_active: true }, 'demo-sentrax-token-offline');
            navigate('/');
          }}>Open demo workspace</Button>
        </div> : <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Officer ID / Username"
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            icon={<UserIcon className="w-4 h-4" />}
            placeholder="admin"
          />

          <Input
            label="Access Key / Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            placeholder="••••••••••••"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Authenticate & Sign In
          </Button>

        </form>}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#1C2E42] text-center text-[10px] font-mono text-[#4D6B85]">
          Gujarat Sentinel Hackathon · Team CipherNetra · Confidential
        </div>
      </div>
    </div>
  );
};
