"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Save, FileText, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { generateSlug, getBrands, createCertificate } from "@/lib/database";
import { fileToBase64 } from "@/lib/fileUtils";
import { logoutAdmin } from "@/lib/auth";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function NewCertificatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    product_name: "",
    product_slug: "",
    certificate_url: "",
    brand_id: "",
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Check if user is logged in
      const token = document.cookie.includes("admin-token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch brands from database
        const brandsData = await getBrands();
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching brands:', error);
      }
    };

    fetchInitialData();
  }, [router]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // For preview, we still use blob URL, but we'll upload to Supabase later
      setFormData({
        ...formData,
        certificate_url: URL.createObjectURL(file),
      });
    }
  };

  const handleProductNameChange = (name: string) => {
    setFormData({
      ...formData,
      product_name: name,
      product_slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('=== FORM SUBMISSION STARTED ===');
    e.preventDefault();
    console.log('Form prevented default');

    // Check if form is valid
    const form = e.target as HTMLFormElement;
    console.log('Form validity:', form.checkValidity());

    if (!form.checkValidity()) {
      console.log('Form is not valid');
      form.reportValidity();
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      console.log('Form data being submitted:', formData);
      console.log('Selected file:', selectedFile);
      console.log('Available brands:', brands);

      // Validate required fields
      if (!formData.product_name) {
        throw new Error('Product name is required');
      }
      if (!formData.product_slug) {
        throw new Error('Product slug is required');
      }
      if (!formData.brand_id) {
        throw new Error('Brand is required');
      }
      if (!selectedFile) {
        throw new Error('Certificate file is required');
      }

      // Convert file to base64
      let certificateUrl = formData.certificate_url;
      let fileData: string | undefined;
      let fileMimeType: string | undefined;
      let fileName: string | undefined;

      if (selectedFile) {
        console.log('Converting file to base64...');
        fileData = await fileToBase64(selectedFile);
        fileMimeType = selectedFile.type;
        fileName = selectedFile.name;
        certificateUrl = fileData;
      }

      // Create certificate in database
      console.log('Calling createCertificate...');
      await createCertificate(
        formData.product_name,
        formData.product_slug,
        certificateUrl,
        formData.brand_id,
        fileData,
        fileMimeType,
        fileName
      );

      setSuccess(true);

      // Redirect to certificates list after 1 second
      setTimeout(() => {
        router.push("/dashboard/certificates");
      }, 1000);

    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat menyimpan sertifikat");
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
              <Link href="/dashboard/certificates">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Tambah Sertifikat Baru</h1>
                <p className="text-sm text-muted-foreground">Upload sertifikat produk baru</p>
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
              <FileText className="w-5 h-5" />
              Informasi Sertifikat
            </CardTitle>
            <CardDescription>
              Masukkan informasi produk dan upload file sertifikat
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
                    Sertifikat berhasil dibuat! Mengarahkan ke halaman sertifikat...
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="product_name">Nama Produk *</Label>
                  <Input
                    id="product_name"
                    type="text"
                    value={formData.product_name}
                    onChange={(e) => handleProductNameChange(e.target.value)}
                    placeholder="Masukkan nama produk"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product_slug">Slug Produk *</Label>
                  <Input
                    id="product_slug"
                    type="text"
                    value={formData.product_slug}
                    onChange={(e) => setFormData({ ...formData, product_slug: e.target.value })}
                    placeholder="produk-slug"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_id">Brand *</Label>
                <Select
                  value={formData.brand_id}
                  onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="certificate">File Sertifikat *</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <Input
                    id="certificate"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="certificate"
                    className="cursor-pointer inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Pilih File
                  </Label>
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      File dipilih: {selectedFile.name}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Format: PDF, JPG, PNG (max 10MB)
                  </p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Link href="/dashboard/certificates">
                  <Button type="button" variant="outline">
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || !formData.product_name || !formData.brand_id || !selectedFile}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan Sertifikat
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">URL Sertifikat:</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Sertifikat akan dapat diakses melalui URL:
            </p>
            <code className="text-xs bg-background px-2 py-1 rounded">
              /{brands.find(b => b.id === formData.brand_id)?.slug || 'brand-slug'}/{formData.product_slug || 'produk-slug'}
            </code>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Tips:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Gunakan nama produk yang unik</li>
              <li>• File sertifikat harus jelas dan terbaca</li>
              <li>• URL akan digenerate otomatis</li>
              <li>• QR code akan dibuat otomatis</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}