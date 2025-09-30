"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Eye } from "lucide-react";

interface CertificateViewerProps {
  fileData?: string;
  fileUrl?: string;
  fileName?: string;
}

export function CertificateViewer({ fileData, fileUrl, fileName }: CertificateViewerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const getFilePreview = () => {
    if (fileData) {
      return fileData;
    }
    return fileUrl || '';
  };

  const isPdf = (fileName?: string, fileData?: string) => {
    if (fileName) {
      return fileName.toLowerCase().endsWith('.pdf');
    }
    if (fileData) {
      return fileData.startsWith('data:application/pdf');
    }
    return false;
  };

  const isImage = (fileName?: string, fileData?: string) => {
    if (fileName) {
      return fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);
    }
    if (fileData) {
      return fileData.startsWith('data:image/');
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="w-4 h-4" />
        <span className="font-medium">{fileName || 'Sertifikat'}</span>
      </div>

      <Card className="border-2">
        <CardContent className="p-0">
          {isPdf(fileName, fileData) ? (
            <div className="relative w-full h-96">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <iframe
                src={getFilePreview()}
                className="w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                title="Preview Sertifikat"
              />
            </div>
          ) : isImage(fileName, fileData) ? (
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
              <img
                src={getFilePreview()}
                alt="Preview Sertifikat"
                className="w-full h-96 object-contain bg-muted"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Dokumen sertifikat tidak dapat dipreview
              </p>
              <p className="text-sm text-muted-foreground">
                Format file tidak didukung untuk preview
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center">
        <Eye className="w-3 h-3 inline mr-1" />
        Preview sertifikat - Hanya untuk dilihat
      </div>
    </div>
  );
}