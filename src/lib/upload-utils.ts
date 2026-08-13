import { GitHubFile } from './github-api';

/**
 * Checks if a path exists in the current array of GitHub files.
 */
function pathExists(path: string, existingFiles: GitHubFile[]): boolean {
  return existingFiles.some(file => file.path === path);
}

/**
 * Generates a unique path by appending (1), (2), etc. if the file already exists.
 * E.g., 'album/photo.jpg' -> 'album/photo (1).jpg'
 */
export function generateUniquePath(desiredPath: string, existingFiles: GitHubFile[]): string {
  if (!pathExists(desiredPath, existingFiles)) {
    return desiredPath;
  }

  const lastDotIndex = desiredPath.lastIndexOf('.');
  let basePath = desiredPath;
  let extension = '';

  if (lastDotIndex !== -1 && lastDotIndex > desiredPath.lastIndexOf('/')) {
    basePath = desiredPath.substring(0, lastDotIndex);
    extension = desiredPath.substring(lastDotIndex);
  }

  let counter = 1;
  let newPath = `${basePath} (${counter})${extension}`;

  while (pathExists(newPath, existingFiles)) {
    counter++;
    newPath = `${basePath} (${counter})${extension}`;
  }

  return newPath;
}
