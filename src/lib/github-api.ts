export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
}

export interface AlbumData {
  name: string;
  path: string;
  images: GitHubFile[];
  coverImage?: string;
}

export interface GalleryConfig {
  owner: string;
  repo: string;
  token?: string;
  branch?: string;
}

const GITHUB_API = 'https://api.github.com';

async function fetchGitHub(url: string, token?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { headers });
}

export async function fetchRepoContents(
  config: GalleryConfig,
  path = ''
): Promise<GitHubFile[]> {
  const { owner, repo, token, branch } = config;
  const ref = branch ? `?ref=${branch}` : '';
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}${ref}`;
  const res = await fetchGitHub(url, token);
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function fetchAlbums(config: GalleryConfig): Promise<AlbumData[]> {
  const contents = await fetchRepoContents(config);
  const dirs = contents.filter((f) => f.type === 'dir');
  const albums: AlbumData[] = [];

  for (const dir of dirs) {
    try {
      const files = await fetchRepoContents(config, dir.path);
      const images = files.filter((f) => isImageFile(f.name));
      if (images.length > 0) {
        albums.push({
          name: dir.name,
          path: dir.path,
          images,
          coverImage: images[0].download_url || undefined,
        });
      }
    } catch {
      // skip inaccessible dirs
    }
  }

  // Also check root-level images
  const rootImages = contents.filter((f) => f.type === 'file' && isImageFile(f.name));
  if (rootImages.length > 0) {
    albums.unshift({
      name: 'Root',
      path: '',
      images: rootImages,
      coverImage: rootImages[0].download_url || undefined,
    });
  }

  return albums;
}

export function isImageFile(name: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name);
}

export function getImageUrl(file: GitHubFile): string {
  return file.download_url || '';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
