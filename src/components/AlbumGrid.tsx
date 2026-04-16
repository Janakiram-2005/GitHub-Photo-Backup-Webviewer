import { motion } from 'framer-motion';
import { Folder, ImageIcon } from 'lucide-react';
import type { AlbumData } from '@/lib/github-api';

interface AlbumGridProps {
  albums: AlbumData[];
  onAlbumClick: (album: AlbumData) => void;
}

export function AlbumGrid({ albums, onAlbumClick }: AlbumGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {albums.map((album, i) => (
        <motion.button
          key={album.path}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onAlbumClick(album)}
          className="group relative aspect-square rounded-xl overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all hover:glow-primary"
        >
          {album.coverImage ? (
            <img
              src={album.coverImage}
              alt={album.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Folder className="w-12 h-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <p className="font-heading text-sm font-semibold text-foreground truncate">{album.name}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <ImageIcon className="w-3 h-3" />
              {album.images.length} photos
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
