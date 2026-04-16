import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { toast } from "sonner";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { getSecretQuestion, resetPassword } = useAuth();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = await getSecretQuestion(email);
    if (q) {
      setQuestion(q);
      setStep(2);
    } else {
      toast.error('No account found with that email address');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer || !newPin) {
      toast.error('Please enter the answer and new PIN');
      return;
    }

    const success = await resetPassword(email, answer, newPin);
    if (success) {
      toast.success('Password successfully reset. Please log in.');
      navigate('/login');
    } else {
      toast.error('Incorrect backup secret answer');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Account Recovery</h1>
          <p className="text-sm text-muted-foreground mt-2">Reset your security credentials</p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Registered Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="Secure email"
                required 
              />
            </div>
            <button 
              type="submit" 
              className="w-full mt-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity glow-primary"
            >
              Verify Profile
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
             <div className="p-3 bg-muted border border-border rounded-lg mb-4 text-center">
               <p className="text-xs text-muted-foreground uppercase font-bold tracking-wide">Your Hint Question:</p>
               <p className="font-heading font-medium text-foreground mt-1">{question}</p>
             </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Answer Hint</label>
              <input 
                type="password" 
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="Your secret answer"
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block mt-4">New Password / PIN</label>
              <input 
                type="password" 
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="Enter a new secure PIN"
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full mt-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity glow-primary"
            >
              Reset Credentials
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col items-center gap-2">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
