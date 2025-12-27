# Otomatisasi Backend API

Semua endpoint di bawah menggunakan base URL server backend Anda (contoh: `http://localhost:5000`). Kecuali disebutkan lain, semua endpoint (selain login/refresh/logout) membutuhkan header `Authorization: Bearer <accessToken>` dari hasil login.

Token akses (`accessToken`) didapat dari `POST /auth/login`. Refresh token disimpan sebagai cookie `refreshToken` (httpOnly) oleh server dan digunakan pada `POST /auth/refresh` untuk meminta token akses baru.

Catatan role dan akses:
- `user`: akses terbatas sesuai penugasan dan data miliknya.
- `admin`: akses penuh ke sebagian besar resource.

## Autentikasi

- POST: `/auth/login`
  - Body: `{ "username": "string", "password": "string" }`
  - Respon 200: `{ status, message, safeUserData, accessToken }` dan set-cookie `refreshToken`.
  - Error: 400 kredensial salah.

- POST: `/auth/logout`
  - Menghapus cookie `refreshToken`. Respon 200/204.

- POST: `/auth/refresh`
  - Menggunakan cookie `refreshToken`. Respon 200: `{ accessToken }` jika valid.

- POST: `/auth/register` (admin)
  - Header: `Authorization`
  - Body: `{ "username": "string", "password": "string", "role": "user|admin" }`
  - Respon 201: `{ msg: "Register Berhasil" }`

## Profil & Users

- GET: `/users/me`
  - Header: `Authorization`
  - Respon: `{ id, username, role, daily_quota, used_today, last_reset_date }`

- GET: `/users` (admin)
  - Respon: `[{ id, username, role, daily_quota, hasSmtp }]`

- POST: `/users` (admin)
  - Body: `{ username, password, role? }`

- PATCH: `/users/:id/password` (admin)
  - Body: `{ password }`

- PATCH: `/users/:id/role` (admin)
  - Body: `{ role: "user|admin" }`
  - Catatan: tidak boleh mengubah role diri sendiri.

- DELETE: `/users/:id` (admin)
  - Menghapus user beserta penugasan, smtp, quota request, dan email log terkait.

## Konfigurasi SMTP/IMAP

- POST: `/config/smtp`
  - Header: `Authorization`
  - Body: `{ email_address, app_password }`
  - Respon: `{ message: "Konfigurasi SMTP tersimpan" }`

- POST: `/config/smtp/verify`
  - Body opsional: `{ email_address, app_password }` (jika kosong, gunakan yang tersimpan)
  - Respon 200 jika kredensial SMTP Gmail valid.

- POST: `/config/imap/verify`
  - Body: `{ email_address, app_password }`
  - Verifikasi koneksi IMAP Gmail.

- GET: `/config/check`
  - Respon: `{ hasConfig: boolean }`

## Badan Publik

Base path: `/badan-publik` (semua butuh `Authorization`)

- GET: `/` 
  - Admin: semua data. User: hanya yang ditugaskan.

- GET: `/:id`

- POST: `/` (admin)
  - Body minimal: `{ nama_badan_publik, kategori, email?, website?, pertanyaan?, status? }`
  - Validasi email unik bila ada.

- PUT: `/:id` 
  - Admin: boleh ubah semua kolom utama.
  - User: hanya boleh koreksi `email`, `website`, `pertanyaan` untuk badan publik yang ditugaskan.

- DELETE: `/:id` (admin)

- POST: `/import` (admin)
  - Body: `{ records: Array<CSVRow|Object> }` dengan kolom fleksibel (`Nama`, `Kategori`, `Email`, dll)
  - Dedup berdasarkan email (case-insensitive) dan skip yang sudah ada di DB.

## Penugasan

Base path: `/assignments`

- GET: `/me` (user)
  - Daftar badan publik yang ditugaskan ke user saat ini.

- GET: `/history/all` (admin)
  - Histori perubahan penugasan (terbaru 100).

- GET: `/` (admin)
  - Daftar penugasan unik (1 per badan publik, yang terbaru) termasuk detail user dan badan publik.

- GET: `/:userId` (admin)
  - Semua penugasan untuk satu user.

- POST: `/` (admin)
  - Body: `{ user_id: number, badan_publik_ids: number[] }`
  - Eksklusif: 1 badan publik hanya untuk 1 user (otomatis melepaskan dari user lain).

## Email & Log

Base path: `/email`

- POST: `/send`
  - Body:
    - `badan_publik_ids: number[]` (wajib)
    - `subject` atau `subject_template`
    - `body` atau `body_template` (HTML didukung; `\n` otomatis `<br/>`)
    - `meta`: objek untuk variabel template, contoh: `{ pemohon, tujuan, tanggal, custom_fields: { ... } }`
    - `attachments?`: `[{ filename, content(base64), encoding?="base64", contentType? }]`
  - Batas lampiran total ~2MB. Validasi SMTP user dan kuota harian diterapkan.
  - Respon: `{ message, results: [{ id, status: 'success'|'failed', reason? }] }`

- GET: `/logs`
  - Admin: semua log. User: hanya miliknya.

- GET: `/stream` (SSE)
  - Stream realtime log sesuai akses user.

- POST: `/retry/:id`
  - Ulangi pengiriman berdasarkan log tertentu (user hanya miliknya).

## Kuota Harian

Base path: `/quota`

- GET: `/me`
  - Respon: `{ daily_quota, used_today, remaining }`

- POST: `/request` (user)
  - Body: `{ requested_quota: number, reason?: string }`
  - Membuat permintaan penambahan kuota (satu pending per user).

- GET: `/my-requests` (user)
  - Daftar permintaan kuota milik user.

- GET: `/requests` (admin)
  - Daftar semua permintaan beserta user.

- PATCH: `/requests/:id` (admin)
  - Body: `{ status: 'approved'|'rejected', admin_note?: string }`
  - `approved`: menambah `daily_quota` user dan menyesuaikan pemakaian hari ini.

- PATCH: `/user/:userId` (admin)
  - Body: `{ daily_quota: number>0 }`

## Kalendari Libur

Base path: `/holidays`

- GET: `/`
  - Mengembalikan daftar libur yang akan datang (libur yang sudah lewat dibersihkan otomatis).

- POST: `/` (admin)
  - Body: `{ date: 'YYYY-MM-DD', name: string }`

- DELETE: `/:id` (admin)

## Berita KIP

Base path: `/news`

- GET: `/kip`
  - Query opsional: `refresh=1|true` untuk memaksa refresh cache.
  - Mengembalikan daftar berita terkurasi dari berbagai RSS.

## Laporan Uji Akses (User)

Base path: `/api/reports`

- POST: `/`
  - Body: `{ badanPublikId: number, answers?: object, status?: 'draft'|'submitted' }`
  - Jika `submitted`, jawaban wajib lengkap sesuai rubric.

- GET: `/me`
  - Daftar laporan milik user saat ini.

- GET: `/:id`
  - Respon: `{ report, rubric }` (rubric berisi daftar pertanyaan `QUESTIONS`).

- PATCH: `/:id/submit`
  - Body opsional: `{ answers: object }`
  - Menyelesaikan laporan; validasi kelengkapan jawaban.

- POST: `/:id/upload`
  - Form-data (multipart): `files` (maks 10 file, masing-masing <=10MB)
  - Query/body: `questionKey` wajib, salah satu key dari rubric `QUESTIONS`.
  - Mimetype diizinkan: `application/pdf`, `image/png`, `image/jpeg`.
  - Respon: `{ evidences: { [questionKey]: [{ path, filename, mimetype, size, uploadedAt }] } }`
  - File statis dapat diakses via `/uploads/uji-akses-reports/<reportId>/<questionKey>/<filename>`.

## Laporan Uji Akses (Admin)

Base path: `/api/admin/reports` (admin)

- GET: `/`
  - Query: `q?`, `badanPublikId?`, `status?=draft|submitted`, `sortBy?=total_skor|created_at`, `sortDir?=asc|desc`
  - Respon: daftar laporan dengan relasi user dan badan publik.

- GET: `/:id`
  - Sama seperti detail user, tanpa batasan kepemilikan.

---

## Contoh Penggunaan (cURL)

Login:
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"secret"}'
```

Mengambil profil diri:
```bash
curl http://localhost:5000/users/me \
  -H "Authorization: Bearer <accessToken>"
```

Kirim email massal (template sederhana):
```bash
curl -X POST http://localhost:5000/email/send \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json" \
  -d '{
    "badan_publik_ids": [1,2],
    "subject_template": "Permohonan Informasi - {{nama_badan_publik}}",
    "body_template": "Yth. {{nama_badan_publik}},\nMohon informasi ...",
    "meta": { "pemohon": "Nama Anda", "tanggal": "2025-12-17" }
  }'
```

Upload bukti laporan (multipart):
```bash
curl -X POST "http://localhost:5000/api/reports/123/upload?questionKey=q1" \
  -H "Authorization: Bearer <accessToken>" \
  -F "files=@C:/path/bukti.pdf"
```
