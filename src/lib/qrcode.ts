import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 200,
    margin = 2,
    color = {
      dark: '#000000',
      light: '#FFFFFF'
    }
  } = options;

  try {
    const dataURL = await QRCode.toDataURL(text, {
      width,
      margin,
      color,
      type: 'image/png'
    });

    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function downloadQRCode(
  text: string,
  filename: string = 'qrcode.png',
  options: QRCodeOptions = {}
): Promise<void> {
  try {
    const dataURL = await generateQRCode(text, options);

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    link.style.display = 'none';

    // Add to document, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
}

export function generateCertificateUrl(brandSlug: string, productSlug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/${brandSlug}/${productSlug}`;
}