# Panduan Setup Cloud Database & Storage (Supabase) untuk Public Team Template

Agar seluruh file yang di-upload oleh Anda maupun tim dapat **dilihat, diedit, dan di-download secara publik oleh semua pengakses website** (baik di localhost maupun di `https://tphkol.pages.dev`), ikuti 3 langkah mudah berikut (gratis 100% tanpa kartu kredit):

---

### Langkah 1: Buat Project Gratis di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan buat akun/login.
2. Klik **New Project**, beri nama (misal: `tphkol-studio`), buat database password, dan pilih region terdekat (misal: `Singapore (ap-southeast-1)`).
3. Tunggu ~1 menit hingga database selesai dibuat.

---

### Langkah 2: Jalankan SQL Setup (1 Kali Klik)
1. Di dashboard Supabase, klik menu **SQL Editor** di sidebar kiri.
2. Klik **New Query**, paste kode SQL berikut seluruhnya, lalu klik tombol **Run**:

```sql
-- 1. Buat Tabel Metadata Template Tim
CREATE TABLE IF NOT EXISTS public.team_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buka Akses Publik (Semua pengunjung bisa melihat, mengupload, mengedit nama, dan menghapus)
ALTER TABLE public.team_templates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read team_templates') THEN
    CREATE POLICY "Public read team_templates" ON public.team_templates FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert team_templates') THEN
    CREATE POLICY "Public insert team_templates" ON public.team_templates FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update team_templates') THEN
    CREATE POLICY "Public update team_templates" ON public.team_templates FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public delete team_templates') THEN
    CREATE POLICY "Public delete team_templates" ON public.team_templates FOR DELETE USING (true);
  END IF;
END $$;

-- Aktifkan Realtime agar setiap upload baru otomatis muncul di layar semua user tanpa perlu refresh
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_templates;

-- 2. Buat Storage Bucket Publik untuk File Media (JPG, PNG, GIF, MP4)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-templates', 'team-templates', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read storage') THEN
    CREATE POLICY "Public read storage" ON storage.objects FOR SELECT USING (bucket_id = 'team-templates');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public insert storage') THEN
    CREATE POLICY "Public insert storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-templates');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public update storage') THEN
    CREATE POLICY "Public update storage" ON storage.objects FOR UPDATE USING (bucket_id = 'team-templates');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public delete storage') THEN
    CREATE POLICY "Public delete storage" ON storage.objects FOR DELETE USING (bucket_id = 'team-templates');
  END IF;
END $$;
```

---

### Langkah 3: Masukkan API Keys ke Cloudflare Pages & Local
1. Di dashboard Supabase, buka **Project Settings** (ikon gear di kiri bawah) > **API**.
2. Salin:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **Project API Keys** (pilih yang **`anon` / `public`**)
3. Tambahkan ke file `.env.local` di komputer Anda untuk pengujian lokal:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xyzcompany.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
   ```
4. Tambahkan juga ke **Cloudflare Pages** agar aktif untuk semua pengunjung online:
   - Buka dashboard Cloudflare > **Workers & Pages** > Pilih project **tphkol**.
   - Masuk ke tab **Settings** > **Environment variables**.
   - Tambahkan 2 variabel di atas untuk environment *Production* & *Preview*:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Klik **Save**.
   - Lakukan **Retry deployment** terbaru atau push commit baru agar Cloudflare Pages memuat environment variable tersebut.

---

### Hasil & Cara Kerja
- **100% Realtime & Global**: Begitu Anda atau rekan tim mengunggah desain (JPG, PNG, GIF, MP4), file langsung tersimpan di CDN Supabase dan database publik.
- **Tampil untuk Semua Pengunjung**: Siapapun yang membuka web `tphkol.pages.dev` akan otomatis melihat hasil unggahan tim di bagian **TEAM TEMPLATE**.
- **Offline / Local Fallback**: Jika variabel Supabase belum dimasukkan, sistem otomatis beralih ke IndexedDB lokal browser sehingga tidak akan pernah crash.
