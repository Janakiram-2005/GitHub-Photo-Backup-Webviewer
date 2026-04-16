import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus } from 'lucide-react';
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    pin: '',
    secretQuestion: '',
    secretAnswer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.phone || !formData.pin || !formData.secretQuestion || !formData.secretAnswer) {
      toast.error('Please fill all current forms');
      return;
    }
    
    const success = await register({
      email: formData.email,
      phone: formData.phone,
      pin: formData.pin,
      secretQuestion: formData.secretQuestion,
      secretAnswer: formData.secretAnswer
    });

    if (success) {
      toast.success('Registration successful. Welcome!');
      navigate('/');
    } else {
      toast.error('User with this email or phone already exists');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border shadow-2xl rounded-2xl p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-2">Set up your security vault credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="you@example.com"
              required 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Phone Number</label>
            <input 
              type="tel" 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="+1234567890"
              required 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Password / PIN</label>
            <input 
              type="password" 
              value={formData.pin}
              onChange={e => setFormData({...formData, pin: e.target.value})}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="pt-2">
            <label className="text-sm font-medium text-foreground mb-1 block text-primary">Backup Secret Routine</label>
            <select 
              value={formData.secretQuestion}
              onChange={e => setFormData({...formData, secretQuestion: e.target.value})}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3 appearance-none" 
              required
            >
              <option value="" disabled>Select a secret question...</option>
              <option value="What was your childhood nickname?">What was your childhood nickname?</option>
              <option value="In what city did you meet your spouse/partner?">In what city did you meet your spouse/partner?</option>
              <option value="What is the name of your favorite childhood friend?">What is the name of your favorite childhood friend?</option>
              <option value="What street did you live on in third grade?">What street did you live on in third grade?</option>
              <option value="What is your oldest sibling's middle name?">What is your oldest sibling's middle name?</option>
            </select>
            <input 
              type="password" 
              value={formData.secretAnswer}
              onChange={e => setFormData({...formData, secretAnswer: e.target.value})}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="Answer (case-insensitive)"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-opacity glow-primary"
          >
            Register Profile
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
