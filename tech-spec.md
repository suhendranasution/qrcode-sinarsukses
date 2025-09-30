Dokumen ini menguraikan arsitektur dan fungsionalitas aplikasi manajemen sertifikat produk menggunakan tech stack **Next.js**, **Shadcn/ui**, dan **Supabase**.

---

## ✨ Fitur-fitur Utama

Aplikasi akan memiliki beberapa fitur inti yang terbagi untuk admin (pengguna internal) dan klien (pengguna akhir).

1.  **Autentikasi Admin**: Sistem login yang aman khusus untuk pengguna internal perusahaan. Pengguna yang belum login akan otomatis diarahkan ke halaman ini. Ini akan dikelola oleh **Supabase Auth**.

2.  **Manajemen Brand (CRUD)**: Admin dapat melakukan operasi **C**reate, **R**ead, **U**pdate, dan **D**elete untuk data brand yang ada di perusahaan. Setiap brand akan memiliki nama dan *slug* (versi nama yang ramah-URL).

3.  **Manajemen Sertifikat & QR Code (CRUD)**:
    * **Upload Sertifikat**: Admin dapat mengunggah file sertifikat (misalnya, gambar atau PDF) ke **Supabase Storage**.
    * **Input Data**: Admin memasukkan informasi seperti nama produk dan memilih brand yang sesuai dari daftar yang sudah ada.
    * **Generate Slug & URL**: Sistem secara otomatis membuat *slug* untuk nama produk, yang akan digabungkan dengan *slug* brand untuk membentuk URL publik yang unik (`/brand-slug/produk-slug`).
    * **Generate QR Code**: Setelah data tersimpan, sistem akan otomatis men-generate QR code yang mengarah ke URL publik sertifikat tersebut. QR code ini dapat diunduh oleh admin.

4.  **Halaman Tampilan Sertifikat Publik**: Halaman publik yang dapat diakses siapa saja (tanpa perlu login) melalui scan QR code. Halaman ini bersifat *read-only* dan akan menampilkan detail sertifikat keaslian produk. Jika URL tidak valid, halaman akan menampilkan pesan "Sertifikat tidak ditemukan".

---

## 🔄 Alur Aplikasi

Berikut adalah alur kerja aplikasi dari sudut pandang admin dan klien.

### Alur Admin (Pengelolaan Sertifikat)

1.  **Login**: Admin membuka aplikasi dan langsung dihadapkan pada halaman `/login`.
2.  **Dashboard**: Setelah berhasil login, admin diarahkan ke halaman dashboard (`/dashboard`) yang berisi daftar semua sertifikat yang telah dibuat.
3.  **Tambah Sertifikat**: Admin menekan tombol "Tambah Sertifikat Baru".
4.  **Isi Form**: Admin mengisi form yang terdiri dari:
    * Input `Nama Produk`.
    * Dropdown untuk `Pilih Brand`.
    * Tombol `Upload File Sertifikat`.
5.  **Simpan**: Setelah menekan "Simpan", sistem akan:
    * Mengunggah file ke **Supabase Storage**.
    * Menyimpan informasi (nama produk, URL file, ID brand, dan slug) ke database **Supabase**.
    * Mengarahkan admin kembali ke dashboard.
6.  **Dapatkan QR Code**: Di dashboard, admin dapat melihat entri baru dan mengunduh QR code yang sudah di-generate secara otomatis untuk ditempelkan pada produk.

### Alur Klien (Verifikasi Sertifikat)

1.  **Scan QR Code**: Klien melakukan scan QR code yang terdapat pada kemasan produk menggunakan smartphone.
2.  **Akses URL**: Smartphone akan membuka browser dan mengarahkan ke URL unik, contoh: `https://namadomain.com/nama-brand/nama-produk-unik`.
3.  **Tampilkan Sertifikat**: Aplikasi **Next.js** akan menangkap parameter `nama-brand` dan `nama-produk-unik` dari URL.
4.  **Validasi**: Aplikasi akan mencari data sertifikat yang cocok di database **Supabase**.
5.  **Hasil**:
    * **Jika ditemukan**: Halaman akan menampilkan file sertifikat beserta nama produk dan brand-nya.
    * **Jika tidak ditemukan**: Halaman akan menampilkan pesan error "Sertifikat tidak ditemukan" (404 Not Found).

---

## 💾 Skema Database

Database akan menggunakan **Supabase (PostgreSQL)**. Berikut adalah desain skema tabel utamanya.

### Tabel `brands`

Tabel ini menyimpan semua brand yang dimiliki perusahaan.

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, ID unik untuk setiap brand. |
| `created_at`| `timestamptz` | Waktu kapan brand dibuat. Default `now()`. |
| `name` | `text` | Nama brand (Contoh: "Brand Sejahtera"). Tidak boleh kosong. |
| `slug` | `text` | Versi URL-friendly dari nama brand (Contoh: "brand-sejahtera"). Unik. |

### Tabel `certificates`

Tabel ini menyimpan data setiap sertifikat yang di-generate.

| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `uuid` | Primary Key, ID unik untuk setiap sertifikat. |
| `created_at`| `timestamptz` | Waktu kapan sertifikat dibuat. Default `now()`. |
| `product_name`| `text` | Nama produk (Contoh: "Kursi Ergonomis Pro"). Tidak boleh kosong. |
| `product_slug`| `text` | Versi URL-friendly dari nama produk (Contoh: "kursi-ergonomis-pro"). |
| `certificate_url` | `text` | URL publik dari file sertifikat yang disimpan di Supabase Storage. |
| `brand_id` | `uuid` | Foreign Key yang merujuk ke `brands.id`. |
| `user_id` | `uuid` | Foreign Key yang merujuk ke `auth.users` untuk melacak siapa yang membuat sertifikat. |

**Catatan Penting**: Kombinasi `brand_id` dan `product_slug` harus **unik** untuk memastikan setiap URL sertifikat bersifat unik dan tidak ada duplikasi.