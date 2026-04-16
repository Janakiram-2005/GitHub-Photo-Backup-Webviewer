import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react';
import { formatFileSize, type GitHubFile, type GalleryConfig } from '@/lib/github-api';
import { SecureImage } from './SecureImage';

interface ImageModalProps {
  image: GitHubFile | null;
  images: GitHubFile[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  config: GalleryConfig;
}

export function ImageModal({ image, images, currentIndex, onClose, onNavigate, config }: ImageModalProps) {
  if (!image) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center"
        onClick={onClose}
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg bg-muted text-foreground hover:bg-secondary transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        {hasPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex - 1); }}
            className="absolute left-4 p-2 rounded-lg bg-muted text-foreground hover:bg-secondary transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate(currentIndex + 1); }}
            className="absolute right-4 p-2 rounded-lg bg-muted text-foreground hover:bg-secondary transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <motion.div
          key={image.sha}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 25 }}
          className="max-w-[90vw] max-h-[80vh] flex flex-col items-center"
          onClick={(e) => e.stopPropagation()}
        >
          <SecureImage
            file={image}
            config={config}
            alt={image.name}
            className="max-w-full max-h-[70vh] object-contain rounded-lg"
          />
          <div className="mt-4 flex items-center gap-4 text-sm">
            <span className="font-mono text-foreground">{image.name}</span>
            <span className="text-muted-foreground">{formatFileSize(image.size)}</span>
            <a
              href={getImageUrl(image)}
              download={image.name}
              className="flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="w-4 h-4" /> Download
            </a>
            <a
              href={image.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-4 h-4" /> GitHub
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
