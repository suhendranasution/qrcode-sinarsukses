"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, Package, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateSlug, createBrand } from "@/lib/database";
import { logoutAdmin } from "@/lib/auth";

export default function NewBrandPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = document.cookie.includes("admin-token");
    if (!token) {
      router.push("/login");
      return;
    }
  }, [router]);

  const handleNameChange = (name: string) => {
    setFormData({
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Create brand in database
      await createBrand(formData.name, formData.slug);

      setSuccess(true);

      // Redirect to brands list after 1 second
      setTimeout(() => {
        router.push("/dashboard/brands");
      }, 1000);

    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan brand");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/brands">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Tambah Brand Baru</h1>
                <p className="text-sm text-muted-foreground">Tambah brand baru ke sistem</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={logoutAdmin}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Informasi Brand
            </CardTitle>
            <CardDescription>
              Masukkan informasi brand yang ingin ditambahkan ke sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>
                    Brand berhasil dibuat! Mengarahkan ke halaman brands...
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nama Brand *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Masukkan nama brand"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Contoh: Brand Sejahtera, Makmur Jaya, Sukses Abadi
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="brand-slug"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version dari nama brand. Akan di-generate otomatis dari nama brand.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard/brands">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Brand
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Tips:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Gunakan nama brand yang unik dan mudah diingat</li>
            <li>• Slug akan digunakan dalam URL sertifikat</li>
            <li>• Pastikan slug tidak mengandung karakter khusus</li>
            <li>• Slug bisa diedit manual jika perlu</li>
          </ul>
        </div>
      </main>
    </div>
  );
}