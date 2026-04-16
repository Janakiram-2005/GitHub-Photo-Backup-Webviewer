import { motion } from 'framer-motion';
import { getImageUrl, formatFileSize, type GitHubFile } from '@/lib/github-api';

interface ImageGridProps {
  images: GitHubFile[];
  onImageClick: (image: GitHubFile, index: number) => void;
}

export function ImageGrid({ images, onImageClick }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {images.map((image, i) => (
        <motion.button
          key={image.sha}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onImageClick(image, i)}
          className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all"
        >
          <img
            src={getImageUrl(image)}
            alt={image.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-background/0 group-hover:bg-background/40 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-xs font-mono text-foreground truncate">{image.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(image.size)}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
