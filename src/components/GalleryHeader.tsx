import { Camera, GitBranch, Grid, Clock, Settings } from 'lucide-react';

interface GalleryHeaderProps {
  view: 'albums' | 'timeline';
  onViewChange: (view: 'albums' | 'timeline') => void;
  onSettingsClick: () => void;
  imageCount: number;
  albumCount: number;
}

export function GalleryHeader({ view, onViewChange, onSettingsClick, imageCount, albumCount }: GalleryHeaderProps) {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center glow-primary">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-gradient">GitHub Photo Backup</h1>
            <p className="text-xs text-muted-foreground font-mono">
              {albumCount} albums · {imageCount} photos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
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
        </div>
      </div>
    </header>
  );
}
