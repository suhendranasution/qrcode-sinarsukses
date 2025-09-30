import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-red-600">Sertifikat Tidak Ditemukan</h1>
          </div>
          <p className="text-muted-foreground">
            Maaf, sertifikat yang Anda cari tidak valid atau tidak tersedia
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Informasi
            </CardTitle>
            <CardDescription>
              Halaman yang Anda akses mungkin memiliki alasan berikut:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-red-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">URL tidak valid</h4>
                  <p className="text-sm text-muted-foreground">
                    Alamat yang Anda masukkan mungkin salah atau tidak lengkap
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-red-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Sertifikat telah dihapus</h4>
                  <p className="text-sm text-muted-foreground">
                    Sertifikat produk ini mungkin telah dihapus oleh pemilik
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-red-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Produk tidak terdaftar</h4>
                  <p className="text-sm text-muted-foreground">
                    Produk ini tidak terdaftar dalam sistem sertifikat kami
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Solusi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Cara verifikasi yang benar:</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Pastikan QR code terlihat jelas dan tidak rusak</li>
                  <li>Scan menggunakan kamera smartphone</li>
                  <li>Periksa kembali URL yang terbuka</li>
                  <li>Hindari memodifikasi URL secara manual</li>
                </ol>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Masih mengalami masalah?</h4>
                <p className="text-sm text-muted-foreground">
                  Hubungi produsen produk atau toko tempat Anda membeli produk untuk mendapatkan bantuan lebih lanjut.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <Home className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Login Admin
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}