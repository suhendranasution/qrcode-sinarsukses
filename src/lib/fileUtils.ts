// Utility functions for file handling without Supabase Storage

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
}

export function base64ToFileUrl(base64Data: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64Data.split(',')[1]}`;
}

export function extractMimeTypeFromBase64(base64Data: string): string {
  const match = base64Data.match(/^data:(.+?);base64,/);
  return match ? match[1] : 'application/octet-stream';
}

export function extractFileNameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch {
    // If URL parsing fails, try to extract from path
    const pathParts = url.split('/');
    return pathParts[pathParts.length - 1];
  }
}

export function downloadBase64File(base64Data: string, filename: string): void {
  const link = document.createElement('a');
  link.href = base64Data;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}