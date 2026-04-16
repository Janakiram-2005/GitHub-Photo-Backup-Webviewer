import { Camera, Settings } from 'lucide-react';

interface EmptyStateProps {
  onSettingsClick: () => void;
}

export function EmptyState({ onSettingsClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 glow-strong">
        <Camera className="w-10 h-10 text-primary" />
      </div>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-2">GitHub Photo Gallery</h2>
      <p className="text-muted-foreground max-w-md mb-6">
        Connect to a GitHub repository to browse your backed-up photos. Configure your repo details to get started.
      </p>
      <button
        onClick={onSettingsClick}
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-heading font-semibold hover:opacity-90 transition-opacity glow-primary"
      >
        <Settings className="w-4 h-4" />
        Configure Repository
      </button>
    </div>
  );
}
