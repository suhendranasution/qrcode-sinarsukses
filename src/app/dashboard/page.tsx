"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, FileText, QrCode, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getBrands, getCertificates } from "@/lib/database";

interface RecentCertificate {
  id: string;
  product_name: string;
  brand_name: string;
  created_at: string;
}

interface DashboardStats {
  totalBrands: number;
  totalCertificates: number;
  recentCertificates: RecentCertificate[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBrands: 0,
    totalCertificates: 0,
    recentCertificates: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch brands and certificates in parallel
        const [brandsData, certificatesData] = await Promise.all([
          getBrands(),
          getCertificates()
        ]);

        // Calculate stats
        const totalBrands = brandsData.length;
        const totalCertificates = certificatesData.length;

        // Get recent certificates (last 5)
        const recentCertificates = certificatesData
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
          .map(cert => ({
            id: cert.id,
            product_name: cert.product_name,
            brand_name: cert.brands.name,
            created_at: cert.created_at
          }));

        setStats({
          totalBrands,
          totalCertificates,
          recentCertificates
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Refresh Halaman</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your certificate management system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Brand</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBrands}</div>
              <p className="text-xs text-muted-foreground">
                Total brand terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sertifikat</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCertificates}</div>
              <p className="text-xs text-muted-foreground">
                Total sertifikat aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QR Code Aktif</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCertificates}</div>
              <p className="text-xs text-muted-foreground">
                Semua aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aktivitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12%</div>
              <p className="text-xs text-muted-foreground">
                Sistem aktif
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-xl">Aksi Cepat</CardTitle>
            <CardDescription>
              Mulai tambahkan data baru dengan satu klik
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/brands/new">
              <Button className="w-full h-12 text-base font-medium" variant="default">
                <Package className="w-5 h-5 mr-3" />
                Tambah Brand Baru
              </Button>
            </Link>
            <Link href="/dashboard/certificates/new">
              <Button className="w-full h-12 text-base font-medium" variant="secondary">
                <FileText className="w-5 h-5 mr-3" />
                Tambah Sertifikat Baru
              </Button>
            </Link>

            {/* Quick Stats */}
            <div className="pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-primary">{stats.totalBrands}</div>
                  <div className="text-xs text-muted-foreground">Total Brand</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-secondary">{stats.totalCertificates}</div>
                  <div className="text-xs text-muted-foreground">Total Sertifikat</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Certificates */}
        <Card>
          <CardHeader>
            <CardTitle>Sertifikat Terbaru</CardTitle>
            <CardDescription>
              Sertifikat yang baru saja ditambahkan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentCertificates.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{cert.product_name}</h4>
                    <p className="text-sm text-muted-foreground">{cert.brand_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(cert.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                  <Badge variant="secondary">Aktif</Badge>
                </div>
              ))}
              {stats.recentCertificates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Belum ada sertifikat
                </div>
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/certificates">
                <Button variant="outline" className="w-full">
                  Lihat Semua Sertifikat
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Manajemen Brand</CardTitle>
            <CardDescription>
              Kelola brand-brand perusahaan Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Kelola data brand perusahaan Anda dengan mudah. Tambah, edit, atau hapus brand sesuai kebutuhan.
              </p>
              <Link href="/dashboard/brands">
                <Button variant="outline" className="w-full">
                  Kelola Brand
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verifikasi Sertifikat</CardTitle>
            <CardDescription>
              Cara verifikasi sertifikat produk
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Pelanggan dapat memverifikasi keaslian produk dengan memindai QR code yang tertera pada kemasan.
              </p>
              <Badge variant="outline">
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR Code
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      </DashboardLayout>
    );
}