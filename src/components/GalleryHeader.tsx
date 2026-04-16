import { Camera, GitBranch, Grid, Clock, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';

interface GalleryHeaderProps {
  view: 'albums' | 'timeline';
  onViewChange: (view: 'albums' | 'timeline') => void;
  onSettingsClick: () => void;
  imageCount: number;
  albumCount: number;
}

export function GalleryHeader({ view, onViewChange, onSettingsClick, imageCount, albumCount }: GalleryHeaderProps) {
  const { logout } = useAuth();
  
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center glow-primary overflow-hidden border border-primary/20">
            <img src="/download.jpg" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-heading font-bold text-gradient truncate">GitHub Photo Backup</h1>
            <p className="text-xs text-muted-foreground font-mono">
              {albumCount} albums · {imageCount} photos
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
          <div className="flex bg-muted rounded-lg p-1 mr-auto sm:mr-0">
            <button
              onClick={() => onViewChange('albums')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'albums'
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-4 h-4 inline mr-1.5" />
              Albums
            </button>
            <button
              onClick={() => onViewChange('timeline')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                view === 'timeline'
                  ? 'bg-primary text-primary-foreground glow-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-1.5" />
              Timeline
            </button>
          </div>
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="GitHub Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <GitBranch className="w-5 h-5" />
          </a>
          <ThemeToggle />
          <button
            onClick={logout}
            className="p-2 ml-1 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
            title="Secure Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
