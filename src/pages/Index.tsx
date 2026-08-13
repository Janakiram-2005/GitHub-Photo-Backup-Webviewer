import { useState, useEffect, useCallback, useRef } from 'react';
import { GalleryHeader } from '@/components/GalleryHeader';
import { AlbumGrid } from '@/components/AlbumGrid';
import { ImageGrid } from '@/components/ImageGrid';
import { ImageModal } from '@/components/ImageModal';
import { SettingsDialog } from '@/components/SettingsDialog';
import { EmptyState } from '@/components/EmptyState';
import { fetchAlbums, uploadFileToGitHub, fileToBase64, type AlbumData, type GalleryConfig, type GitHubFile, getImageUrl } from '@/lib/github-api';
import { generateUniquePath } from '@/lib/upload-utils';
import { cleanOldLogs, logActivity } from '@/lib/logger';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Loader2, AlertTriangle, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams, setSearchParams] = useSearchParams();
  
  const albumParam = searchParams.get('album');
  const selectedAlbum = albums.find(a => a.path === albumParam) || null;

  const [modalImage, setModalImage] = useState<GitHubFile | null>(null);
  const [modalIndex, setModalIndex] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, filename: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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
        const auth = config.token ? { 'Authorization': `Bearer ${config.token}` } : {};
        const fetchUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodeURIComponent(image.path)}`;
        const response = await fetch(fetchUrl, { headers: { ...auth, 'Accept': 'application/vnd.github.v3.raw' }});
        
        if (!response.ok) throw new Error('Download request failed');

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
    cleanOldLogs();
    if (config.owner && config.repo) loadGallery();
  }, [config, loadGallery]);

  const handleAlbumClick = (album: AlbumData) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('album', album.path);
    setSearchParams(newParams);
  };

  const handleBackToAlbums = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('album');
    setSearchParams(newParams);
  };

  const handleSaveConfig = (newConfig: GalleryConfig) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    setConfig(newConfig);
    handleBackToAlbums();
  };

  const handleImageClick = (image: GitHubFile, index: number) => {
    setModalImage(image);
    setModalIndex(index);
  };

  const handleNavigate = (index: number) => {
    setModalImage(currentImages[index]);
    setModalIndex(index);
  };

  const handleUploadClick = () => {
    if (!config.owner || !config.repo || !config.token) {
      toast.error('Please configure your GitHub repository and token first');
      setSettingsOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleUploadFolderClick = () => {
    if (!config.owner || !config.repo || !config.token) {
      toast.error('Please configure your GitHub repository and token first');
      setSettingsOpen(true);
      return;
    }
    folderInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: files.length, filename: '' });
    toast.info(`Uploading ${files.length} file(s)...`);
    logActivity(`Started uploading ${files.length} file(s)`);

    let successCount = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(prev => ({ ...prev, current: i + 1, filename: file.name }));
      try {
        const base64Content = await fileToBase64(file);
        
        let pathPrefix = selectedAlbum && selectedAlbum.path ? `${selectedAlbum.path}/` : '';
        let fileName = file.name;

        // Support folder upload structures
        if (file.webkitRelativePath) {
          // webkitRelativePath is usually "FolderName/SubFolder/image.jpg"
          // We can remove the top-level folder name if we are uploading INTO an album, 
          // or keep it if uploading to Root. Let's keep the full relative path to preserve structure.
          fileName = file.webkitRelativePath;
        }

        const desiredPath = `${pathPrefix}${fileName}`;
        const uniquePath = generateUniquePath(desiredPath, allImages);
        
        await uploadFileToGitHub(config, uniquePath, base64Content, `Upload ${uniquePath}`);
        successCount++;
        logActivity(`Uploaded ${uniquePath}`);
        
        if (uniquePath !== desiredPath) {
          logActivity(`Auto-renamed duplicate ${desiredPath} to ${uniquePath}`);
        }
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
        logActivity(`Error uploading ${file.name}: ${err.message}`);
      }
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
    
    if (successCount > 0) {
      toast.success(`Successfully uploaded ${successCount} file(s)`);
      logActivity(`Upload batch completed with ${successCount} successes.`);
      loadGallery(); // Refresh the gallery
    }
  };

  const isConfigured = config.owner && config.repo;

  return (
    <div className="min-h-screen bg-background">
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <input 
        type="file" 
        multiple 
        {...({ webkitdirectory: "" } as any)} 
        className="hidden" 
        ref={folderInputRef} 
        onChange={handleFileChange} 
      />
      
      <GalleryHeader
        view={view}
        onViewChange={setView}
        onSettingsClick={() => setSettingsOpen(true)}
        onUploadClick={handleUploadClick}
        onUploadFolderClick={handleUploadFolderClick}
        imageCount={allImages.length}
        albumCount={albums.length}
      />

      <main className="container mx-auto px-4 py-6">
        {!isConfigured && <EmptyState onSettingsClick={() => setSettingsOpen(true)} />}

        {isConfigured && (loading || isUploading) && (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            {loading && !isUploading && <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />}
            
            {isUploading && (
              <div className="w-full max-w-md bg-card p-6 rounded-xl border border-border shadow-lg">
                <h3 className="text-sm font-semibold mb-2">Uploading Files...</h3>
                <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-2 mb-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{uploadProgress.current} of {uploadProgress.total}</span>
                  <span className="truncate max-w-[200px] ml-4">{uploadProgress.filename}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isConfigured && error && !isUploading && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mb-3" />
            <p className="text-foreground font-medium">{error}</p>
            <button onClick={loadGallery} className="mt-3 text-sm text-primary hover:underline">
              Retry
            </button>
          </div>
        )}

        {isConfigured && !loading && !error && !isUploading && (
          <>
            {selectedAlbum && (
              <button
                onClick={handleBackToAlbums}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to albums
              </button>
            )}

            {view === 'albums' && !selectedAlbum && (
              <AlbumGrid albums={albums} onAlbumClick={handleAlbumClick} />
            )}

            {(view === 'timeline' || selectedAlbum) && (
              <ImageGrid 
                images={currentImages} 
                onImageClick={handleImageClick} 
                selectedImages={selectedImages}
                onSelectImage={handleSelectImage}
                config={config}
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
        config={config}
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
