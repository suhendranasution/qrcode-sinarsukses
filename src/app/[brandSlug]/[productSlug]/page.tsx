import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle } from "lucide-react";
import { getCertificateBySlugs } from "@/lib/database";
import { CertificateViewer } from "@/components/CertificateViewer";

interface PageProps {
  params: Promise<{
    brandSlug: string;
    productSlug: string;
  }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { brandSlug, productSlug } = await params;

  // Get certificate from database
  const certificate = await getCertificateBySlugs(brandSlug, productSlug);

  // Check if the certificate exists
  if (!certificate) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-green-600">Verifikasi Sertifikat</h1>
          </div>
          <p className="text-muted-foreground">
            Sertifikat keaslian produk terverifikasi
          </p>
        </div>

        {/* Certificate Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{certificate.product_name}</CardTitle>
                <CardDescription className="text-lg">
                  {certificate.brands.name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <Badge variant="default" className="bg-green-600 text-white">
                  Terverifikasi
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Certificate Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Informasi Produk</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nama Produk:</span>
                      <span className="font-medium">{certificate.product_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Brand:</span>
                      <span className="font-medium">{certificate.brands.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tanggal Sertifikat:</span>
                      <span className="font-medium">
                        {new Date(certificate.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID Sertifikat:</span>
                      <span className="font-medium font-mono text-xs">
                        {certificate.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Status Verifikasi</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Sertifikat Valid</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Produk ini memiliki sertifikat keaslian yang valid
                  </p>
                </div>
              </div>

              {/* Certificate Document */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Dokumen Sertifikat</h3>
                  <CertificateViewer
                    fileData={certificate.file_data}
                    fileUrl={certificate.certificate_url}
                    fileName={certificate.file_name}
                  />
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Keamanan</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Terverifikasi secara digital</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Dikelola oleh produsen resmi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Aman dan terpercaya</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tentang Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Produk ini telah melalui proses sertifikasi dan verifikasi ketat untuk memastikan kualitas dan keasliannya.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tentang Brand</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {certificate.brands.name} adalah brand terpercaya yang berkomitmen pada kualitas dan kepuasan pelanggan.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Cara Verifikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Scan QR code pada kemasan produk atau kunjungi URL unik produk untuk verifikasi keaslian.
              </p>
            </CardContent>
          </Card>
        </div>

              </div>
    </div>
  );
}