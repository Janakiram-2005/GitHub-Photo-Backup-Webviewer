import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, GitBranch, User, BookOpen } from 'lucide-react';
import type { GalleryConfig } from '@/lib/github-api';

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  config: GalleryConfig;
  onSave: (config: GalleryConfig) => void;
}

export function SettingsDialog({ open, onClose, config, onSave }: SettingsDialogProps) {
  const [owner, setOwner] = useState(config.owner);
  const [repo, setRepo] = useState(config.repo);
  const [token, setToken] = useState(config.token || '');
  const [branch, setBranch] = useState(config.branch || 'main');

  const handleSave = () => {
    onSave({ owner, repo, token: token || undefined, branch: branch || undefined });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-card border border-border rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-bold text-gradient">Repository Settings</h2>
              <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                  <User className="w-4 h-4 text-primary" /> Owner
                </label>
                <input
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="github-username"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                  <BookOpen className="w-4 h-4 text-primary" /> Repository
                </label>
                <input
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="photo-backup"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                  <GitBranch className="w-4 h-4 text-primary" /> Branch
                </label>
                <input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5">
                  <Key className="w-4 h-4 text-primary" /> Token (optional, for private repos)
                </label>
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={!owner || !repo}
              className="mt-6 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-heading font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 glow-primary"
            >
              Save & Load Gallery
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
