"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Search, FileText, Download, QrCode, Upload, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DashboardLayout } from "@/components/DashboardLayout";
import { getCertificates, getBrands, createCertificate, updateCertificate, deleteCertificate, generateSlug } from "@/lib/database";
import { downloadQRCode, generateCertificateUrl } from "@/lib/qrcode";
import { fileToBase64, extractMimeTypeFromBase64, extractFileNameFromUrl, downloadBase64File } from "@/lib/fileUtils";

interface Certificate {
  id: string;
  product_name: string;
  product_slug: string;
  certificate_url: string;
  brand_id: string;
  created_at: string;
  file_data?: string;
  file_mime_type?: string;
  file_name?: string;
  brands: {
    id: string;
    name: string;
    slug: string;
  };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [formData, setFormData] = useState({
    product_name: "",
    product_slug: "",
    certificate_url: "",
    brand_id: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCertificates();
    fetchBrands();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await getCertificates();
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const data = await getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let certificateUrl = formData.certificate_url;
      let fileData: string | undefined;
      let fileMimeType: string | undefined;
      let fileName: string | undefined;

      // Convert file to base64 if a new file is selected
      if (selectedFile) {
        console.log('Converting file to base64...');
        fileData = await fileToBase64(selectedFile);
        fileMimeType = selectedFile.type;
        fileName = selectedFile.name;
        certificateUrl = fileData; // Use base64 data as URL
      } else if (editingCertificate && editingCertificate.file_data) {
        // Keep existing file data if no new file is selected
        fileData = editingCertificate.file_data;
        fileMimeType = editingCertificate.file_mime_type;
        fileName = editingCertificate.file_name;
        certificateUrl = editingCertificate.file_data;
      }

      if (editingCertificate) {
        // Update existing certificate
        await updateCertificate(editingCertificate.id, {
          product_name: formData.product_name,
          product_slug: formData.product_slug,
          certificate_url: certificateUrl,
          brand_id: formData.brand_id,
          file_data: fileData,
          file_mime_type: fileMimeType,
          file_name: fileName,
        });
      } else {
        // Create new certificate
        if (!selectedFile) {
          throw new Error('Certificate file is required');
        }
        await createCertificate(
          formData.product_name,
          formData.product_slug,
          certificateUrl,
          formData.brand_id,
          fileData,
          fileMimeType,
          fileName
        );
      }

      setIsDialogOpen(false);
      setEditingCertificate(null);
      setFormData({
        product_name: "",
        product_slug: "",
        certificate_url: "",
        brand_id: "",
      });
      setSelectedFile(null);
      setExistingFileUrl(null);
      fetchCertificates();
    } catch (error) {
      console.error("Error saving certificate:", error);
      alert("Terjadi kesalahan saat menyimpan sertifikat");
    }
  };

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

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      product_name: certificate.product_name,
      product_slug: certificate.product_slug,
      certificate_url: certificate.file_data || certificate.certificate_url,
      brand_id: certificate.brand_id,
    });
    setExistingFileUrl(certificate.file_data || certificate.certificate_url);
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (certificateId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus sertifikat ini?")) {
      try {
        await deleteCertificate(certificateId);
        fetchCertificates();
      } catch (error) {
        console.error("Error deleting certificate:", error);
        alert("Terjadi kesalahan saat menghapus sertifikat");
      }
    }
  };

  const handleDownloadQR = async (certificate: Certificate) => {
    try {
      const url = generateCertificateUrl(certificate.brands.slug, certificate.product_slug);
      const filename = `${certificate.product_slug}-qrcode.png`;
      await downloadQRCode(url, filename);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      alert("Gagal mengunduh QR code");
    }
  };

  const handleProductNameChange = (name: string) => {
    setFormData({
      ...formData,
      product_name: name,
      product_slug: generateSlug(name),
    });
  };

  const filteredCertificates = certificates.filter(certificate =>
    certificate.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    certificate.brands.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    certificate.product_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Sertifikat</h2>
        <p className="text-muted-foreground">
          Kelola sertifikat produk Anda
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Cari sertifikat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Sertifikat
            </Button>
          </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                  <DialogHeader>
                    <DialogTitle>
                      {editingCertificate ? "Edit Sertifikat" : "Tambah Sertifikat Baru"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCertificate
                        ? "Edit informasi sertifikat yang ada. File dapat diganti atau dibiarkan tetap sama."
                        : "Tambah sertifikat baru ke sistem."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product_name" className="text-right">
                        Nama Produk
                      </Label>
                      <Input
                        id="product_name"
                        value={formData.product_name}
                        onChange={(e) => handleProductNameChange(e.target.value)}
                        className="col-span-3"
                        placeholder="Masukkan nama produk"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="product_slug" className="text-right">
                        Slug Produk
                      </Label>
                      <Input
                        id="product_slug"
                        value={formData.product_slug}
                        onChange={(e) => setFormData({ ...formData, product_slug: e.target.value })}
                        className="col-span-3"
                        placeholder="produk-slug"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="brand_id" className="text-right">
                        Brand
                      </Label>
                      <Select
                        value={formData.brand_id}
                        onValueChange={(value) => setFormData({ ...formData, brand_id: value })}
                      >
                        <SelectTrigger className="col-span-3">
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
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="certificate" className="text-right">
                        File Sertifikat
                      </Label>
                      <div className="col-span-3">
                        {existingFileUrl && !selectedFile && (
                          <div className="mb-2 p-2 bg-muted rounded text-sm">
                            <p className="font-medium">File saat ini:</p>
                            {editingCertificate?.file_name ? (
                              <>
                                <p className="text-xs">{editingCertificate.file_name}</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingCertificate.file_data) {
                                      downloadBase64File(
                                        editingCertificate.file_data,
                                        editingCertificate.file_name || 'certificate'
                                      );
                                    }
                                  }}
                                  className="text-blue-600 hover:underline text-xs mt-1"
                                >
                                  Download file
                                </button>
                              </>
                            ) : (
                              <a
                                href={existingFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline break-all text-xs"
                              >
                                {existingFileUrl}
                              </a>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Pilih file baru untuk mengganti
                            </p>
                          </div>
                        )}
                        <Input
                          id="certificate"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          className="cursor-pointer"
                        />
                        {selectedFile && (
                          <p className="text-sm text-muted-foreground mt-1">
                            File baru dipilih: {selectedFile.name}
                          </p>
                        )}
                        {!editingCertificate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Format: PDF, JPG, PNG (max 10MB)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">
                      {editingCertificate ? "Update" : "Simpan"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredCertificates.length} sertifikat ditemukan
          </p>
        </div>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCertificates.map((certificate) => (
            <Card key={certificate.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{certificate.product_name}</span>
                  <Badge variant="secondary">{certificate.brands.name}</Badge>
                </CardTitle>
                <CardDescription>
                  {certificate.brands.slug}/{certificate.product_slug}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span className="truncate">
                        {certificate.file_name || extractFileNameFromUrl(certificate.certificate_url)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (certificate.file_data) {
                          downloadBase64File(
                            certificate.file_data,
                            certificate.file_name || 'certificate'
                          );
                        } else {
                          window.open(certificate.certificate_url, '_blank');
                        }
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Dibuat {new Date(certificate.created_at).toLocaleDateString('id-ID')}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(certificate)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadQR(certificate)}
                      >
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(certificate.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCertificates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tidak ada sertifikat ditemukan</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Coba kata kunci lain" : "Mulai dengan menambahkan sertifikat pertama Anda"}
            </p>
            {!searchTerm && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Sertifikat Pertama
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        )}
      </DashboardLayout>
  );
}