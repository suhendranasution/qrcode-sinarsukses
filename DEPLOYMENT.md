# Vercel Deployment Guide

## Environment Variables Checklist

Berikut environment variables yang HARUS ditambahkan di Vercel untuk production deployment:

### ✅ Required Variables

```bash
# Supabase Database Connection
NEXT_PUBLIC_SUPABASE_URL=https://nzssgragcalalmbtfdym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56c3NncmFnY2FsYWxtYnRmZHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxODI2NzMsImV4cCI6MjA3NDc1ODY3M30.fgvaXAnmCmTqgCY9LMExcaFv0yR1wMsXfQ6jOoCQ_to

# Application URL
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 🔧 Optional Variables

```bash
# Admin Credentials (untuk development fallback)
NEXT_PUBLIC_ADMIN_EMAIL=superadmin@example.com
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

## Setup Steps

1. **Login ke Vercel Dashboard**
   - Buka vercel.com/dashboard
   - Pilih project Anda

2. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Klik "Add New" untuk setiap variable
   - **Important**: Gunakan nama variable yang EXACT sama

3. **Redeploy**
   - Setelah menambahkan variables, redeploy project
   - Go to Deployments → Click "..." → Redeploy

## Testing Production

### 1. Database Connection Test
Buka endpoint ini di browser:
```
https://your-domain.vercel.app/api/debug/supabase
```

Expected response:
```json
{
  "success": true,
  "message": "Database connection successful",
  "connected": true
}
```

### 2. Basic Functionality Test
- Login ke aplikasi
- Coba tambah brand baru
- Coba tambah certificate baru

## Common Issues & Solutions

### ❌ Error: "supabaseUrl is required"
**Cause**: Missing NEXT_PUBLIC_SUPABASE_URL
**Fix**: Tambahkan Supabase URL di environment variables

### ❌ Error: "Invalid environment variables"
**Cause**: Variable names tidak match
**Fix**: Pastikan nama variables EXACT sama dengan yang di .env.local

### ❌ Error: "Database connection failed"
**Cause**: Supabase credentials salah atau RLS policies block
**Fix**:
1. Verify credentials di Supabase dashboard
2. Check RLS policies di database

### ❌ Data tidak tersimpan
**Cause**: RLS policies memblock write operations
**Fix**: Jalankan migration 004_fix_rls_policies.sql di Supabase

## Local vs Production

| Local (berhasil) | Production (gagal) | Solution |
|-----------------|-------------------|----------|
| Database berjalan | Database gagal | Add environment variables |
| Login berjalan | Login gagal | Add admin credentials |
| Data tersimpan | Data tidak tersimpan | Check RLS policies |