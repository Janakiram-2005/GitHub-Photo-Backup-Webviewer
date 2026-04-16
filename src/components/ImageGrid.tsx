import { motion } from 'framer-motion';
import { useRef } from 'react';
import { getImageUrl, formatFileSize, type GitHubFile } from '@/lib/github-api';
import { Check } from 'lucide-react';

interface ImageGridProps {
  images: GitHubFile[];
  onImageClick: (image: GitHubFile, index: number) => void;
  selectedImages: GitHubFile[];
  onSelectImage: (image: GitHubFile) => void;
}

export function ImageGrid({ images, onImageClick, selectedImages, onSelectImage }: ImageGridProps) {
  const isSelectMode = selectedImages.length > 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {images.map((image, i) => (
        <ImageGridItem 
          key={image.sha} 
          image={image} 
          index={i} 
          isSelectMode={isSelectMode} 
          isSelected={selectedImages.some(img => img.sha === image.sha)}
          onImageClick={onImageClick}
          onSelectImage={onSelectImage}
        />
      ))}
    </div>
  );
}

interface ImageGridItemProps {
  image: GitHubFile;
  index: number;
  isSelected: boolean;
  isSelectMode: boolean;
  onImageClick: (image: GitHubFile, index: number) => void;
  onSelectImage: (image: GitHubFile) => void;
}

function ImageGridItem({ image, index, isSelected, isSelectMode, onImageClick, onSelectImage }: ImageGridItemProps) {
  const timerRef = useRef<NodeJS.Timeout>();

  const handlePointerDown = () => {
    if (isSelectMode) return;
    timerRef.current = setTimeout(() => {
      onSelectImage(image);
    }, 500);
  };

  const handlePointerUp = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isSelectMode) {
      onSelectImage(image);
    } else {
      onImageClick(image, index);
    }
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onClick={handleClick}
      className={`group relative aspect-square rounded-lg overflow-hidden border transition-all ${
        isSelected ? 'border-primary ring-2 ring-primary/50' : 'bg-muted border-border hover:border-primary/50'
      }`}
    >
      {isSelected && (
        <div className="absolute top-2 left-2 z-10 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4" />
        </div>
      )}
      <img
        src={getImageUrl(image)}
        alt={image.name}
        className={`w-full h-full object-cover transition-transform duration-300 ${isSelected ? 'scale-105' : 'group-hover:scale-105'}`}
        loading="lazy"
      />
      <div className={`absolute inset-0 transition-colors ${isSelected ? 'bg-background/20' : 'bg-background/0 group-hover:bg-background/40'}`} />
      <div className={`absolute bottom-0 left-0 right-0 p-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <p className="text-xs font-mono text-white drop-shadow-md truncate">{image.name}</p>
        <p className="text-xs text-white/80 drop-shadow-md">{formatFileSize(image.size)}</p>
      </div>
    </motion.button>
  );
}
