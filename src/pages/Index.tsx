import { useState, useEffect, useCallback } from 'react';
import { GalleryHeader } from '@/components/GalleryHeader';
import { AlbumGrid } from '@/components/AlbumGrid';
import { ImageGrid } from '@/components/ImageGrid';
import { ImageModal } from '@/components/ImageModal';
import { SettingsDialog } from '@/components/SettingsDialog';
import { EmptyState } from '@/components/EmptyState';
import { fetchAlbums, type AlbumData, type GalleryConfig, type GitHubFile, getImageUrl } from '@/lib/github-api';
import { ArrowLeft, Loader2, AlertTriangle, Download, X } from 'lucide-react';
import { toast } from 'sonner';

const STORAGE_KEY = 'github-gallery-config';

function loadConfig(): GalleryConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (_e) {
    // ignore
  }
  return { owner: '', repo: '' };
}

export default function Index() {
  const [config, setConfig] = useState<GalleryConfig>(loadConfig);
  const [albums, setAlbums] = useState<AlbumData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'albums' | 'timeline'>('albums');
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumData | null>(null);
  const [modalImage, setModalImage] = useState<GitHubFile | null>(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [selectedImages, setSelectedImages] = useState<GitHubFile[]>([]);

  const allImages = albums.flatMap((a) => a.images);
  const currentImages = selectedAlbum ? selectedAlbum.images : allImages;

  const handleSelectImage = (image: GitHubFile) => {
    setSelectedImages((prev) => {
      const exists = prev.find((i) => i.sha === image.sha);
      if (exists) {
        return prev.filter((i) => i.sha !== image.sha);
      }
      return [...prev, image];
    });
  };

  const handleBatchDownload = async () => {
    if (selectedImages.length === 0) return;
    toast.info(`Preparing ${selectedImages.length} images for download...`);
    
    // In a browser, rapid simultaneous downloads may be blocked or prompt user
    for (const image of selectedImages) {
      try {
        const response = await fetch(getImageUrl(image));
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = image.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Slight delay to prevent aggressive browser blocking
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error('Failed to download', image.name, err);
      }
    }
    toast.success('Downloads completed!');
    setSelectedImages([]);
  };

  const loadGallery = useCallback(async () => {
    if (!config.owner || !config.repo) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAlbums(config);
      setAlbums(data);
    } catch (e) {
      const err = e as Error;
      setError(err.message || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (config.owner && config.repo) loadGallery();
  }, [config, loadGallery]);

  const handleSaveConfig = (newConfig: GalleryConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    setConfig(newConfig);
    setSelectedAlbum(null);
  };

  const handleImageClick = (image: GitHubFile, index: number) => {
    setModalImage(image);
    setModalIndex(index);
  };

  const handleNavigate = (index: number) => {
    setModalImage(currentImages[index]);
    setModalIndex(index);
  };

  const isConfigured = config.owner && config.repo;

  return (
    <div className="min-h-screen bg-background">
      <GalleryHeader
        view={view}
        onViewChange={setView}
        onSettingsClick={() => setSettingsOpen(true)}
        imageCount={allImages.length}
        albumCount={albums.length}
      />

      <main className="container mx-auto px-4 py-6">
        {!isConfigured && <EmptyState onSettingsClick={() => setSettingsOpen(true)} />}

        {isConfigured && loading && (
          <div className="flex items-center justify-center min-h-[50vh]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {isConfigured && error && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
            <p className="text-foreground font-medium">{error}</p>
            <button onClick={loadGallery} className="mt-3 text-sm text-primary hover:underline">
              Retry
            </button>
          </div>
        )}

        {isConfigured && !loading && !error && (
          <>
            {selectedAlbum && (
              <button
                onClick={() => setSelectedAlbum(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to albums
              </button>
            )}

            {view === 'albums' && !selectedAlbum && (
              <AlbumGrid albums={albums} onAlbumClick={setSelectedAlbum} />
            )}

            {(view === 'timeline' || selectedAlbum) && (
              <ImageGrid 
                images={currentImages} 
                onImageClick={handleImageClick} 
                selectedImages={selectedImages}
                onSelectImage={handleSelectImage}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Action Bar for Selection Mode */}
      {selectedImages.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 bg-secondary text-secondary-foreground shadow-2xl rounded-full border border-border animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">{selectedImages.length} selected</span>
          <button 
            onClick={handleBatchDownload}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button 
            onClick={() => setSelectedImages([])}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <ImageModal
        image={modalImage}
        images={currentImages}
        currentIndex={modalIndex}
        onClose={() => setModalImage(null)}
        onNavigate={handleNavigate}
      />

      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        config={config}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
