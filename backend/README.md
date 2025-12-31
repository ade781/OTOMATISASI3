# Dokumentasi API Auth

Base path: `/auth`

## POST /auth/login

- Deskripsi: Autentikasi user dan set cookie `accessToken`, `refreshToken`, `csrfToken`.
- Auth: tidak perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - username: string
  - password: string
  - turnstileToken: string
- Response (JSON):
  - status: "Success" | "Failed"
  - message: string
  - user: object (tanpa password dan token)
  - csrfToken: string
- Cookies di-set: `accessToken`, `refreshToken`, `csrfToken`

## GET /auth/csrf

- Deskripsi: Mengambil token CSRF dan set cookie `csrfToken` jika belum ada.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - csrfToken: string
- Cookies di-set: `csrfToken` (jika belum ada)

## POST /auth/logout

- Deskripsi: Logout dan hapus cookie autentikasi (akses, refresh, csrf token).
- Auth: tidak perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - status: "success" | "error"
  - message: string
- Cookies dihapus: `accessToken`, `refreshToken`, `csrfToken`

## POST /auth/refresh

- Deskripsi: Refresh akses (rotate refresh token) dan set cookie `accessToken` baru.
- Auth: tidak perlu.(otomatis ambil cookies)
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - success: boolean
- Cookies di-set: `accessToken`, `refreshToken` (baru)

## POST /auth/register

- Deskripsi: Membuat user baru.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - username: string (wajib)
  - password: string (wajib)
  - role: "user" | "admin"
  - group: string (opsional)
  - nomer_hp: string (opsional)
  - email: string (opsional)
- Response (JSON):
  - message: string

# Dokumentasi API Config

Base path: `/config`

## GET /config/check

- Deskripsi: Mengecek apakah user sudah punya konfigurasi SMTP.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - hasConfig: boolean

## POST /config/smtp

- Deskripsi: Menyimpan email dan App Password SMTP untuk user.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - email_address: string (wajib)
  - app_password: string (wajib)
- Response (JSON):
  - message: string

## POST /config/smtp/verify

- Deskripsi: Verifikasi kredensial SMTP.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - email_address: string (opsional)
  - app_password: string (opsional)
- Response (JSON):
  - message: string

## POST /config/imap/verify

- Deskripsi: Verifikasi kredensial IMAP Gmail.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - email_address: string (wajib)
  - app_password: string (wajib)
- Response (JSON):
  - message: string

## POST /config/reset

- Deskripsi: Reset database, menghapus semua data terkait (kecuali user admin) dan membersihkan folder uploads.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - message: string
  - deleted: object

# Dokumentasi API Badan Publik

Base path: `/badan-publik`

## GET /badan-publik

- Deskripsi: Mengambil daftar badan publik.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - array of object BadanPublik:
    - id, nama_badan_publik, kategori, email, website, pertanyaan, status, sent_count, createdAt, updatedAt

## GET /badan-publik/:id

- Deskripsi: Mengambil detail satu badan publik.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - object BadanPublik

## POST /badan-publik

- Deskripsi: Membuat data badan publik baru.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - nama_badan_publik: string (wajib)
  - kategori: string (wajib)
  - email: string (opsional, harus valid dan unik)
  - website: string (opsional)
  - pertanyaan: string (opsional)
  - status: "belum dibalas" | "dibalas" | "selesai" (opsional)
  - sent_count: number (opsional)
- Response (JSON):
  - object BadanPublik (terbuat)

## PUT /badan-publik/:id

- Deskripsi: Memperbarui data badan publik.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - nama_badan_publik, kategori, email, website, pertanyaan, status, sent_count (opsional)
- Response (JSON):
  - object BadanPublik (terbarui)

## DELETE /badan-publik/:id

- Deskripsi: Menghapus satu data badan publik.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - message: string

## POST /badan-publik/bulk-delete

- Deskripsi: Menghapus banyak data badan publik sekaligus.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - ids: number[] (wajib)
  - force: boolean (opsional; jika true, juga menghapus data terkait)
- Response (JSON):
  - message: string
  - deleted: number

## POST /badan-publik/import

- Deskripsi: Import daftar badan publik dari array records.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - records: array of object
    - nama_badan_publik/nama, kategori, email, website, pertanyaan, status, thread_id (opsional)
- Response (JSON):
  - message: string

## POST /badan-publik/import-assign

- Deskripsi: Import badan publik dan otomatis penugasan ke user penguji.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - records: array of object
    - nama_badan_publik/nama, kategori, email, website, pertanyaan (opsional)
    - lembaga (opsional)
    - nama_penguji, no_hp_penguji (opsional; jika ada, bisa dibuat user baru)
    - email_penguji (opsional)
- Response (JSON):
  - message: string
  - stats: object
    - created: number
    - skippedExisting: number
    - skippedDuplicateFile: number
    - createdUsers: number
    - assigned: number
    - skippedAssigned: number
    - skippedNoUser: number

# Dokumentasi API Email

Base path: `/email`

## GET /email/logs

- Deskripsi: Mengambil daftar riwayat pengiriman email.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - array of object EmailLog:
    - id, user, badanPublik, subject, body, status, message_id, attachments_meta, sent_at, retry_of_id (opsional)

## GET /email/stream

- Deskripsi: Stream SSE untuk update realtime log email.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (SSE):
  - event data: object EmailLog per update

## POST /email/logs/bulk-delete

- Deskripsi: Menghapus banyak log email sekaligus.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - ids: number[] (wajib)
- Response (JSON):
  - message: string
  - deleted: number

## POST /email/send

- Deskripsi: Mengirim email massal ke daftar badan publik.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - badan_publik_ids: number[] (wajib)
  - subject: string (opsional)
  - body: string (opsional)
  - subject_template: string (opsional)
  - body_template: string (opsional)
  - meta: object (opsional)
  - attachments: array of object (opsional)
    - filename: string
    - content: string (base64)
    - contentType: string (opsional)
- Response (JSON):
  - message: string
  - results: array of object
    - id: number
    - status: "success" | "failed"
    - reason: string (opsional)

## POST /email/retry/:id

- Deskripsi: Mengulang pengiriman email berdasarkan log tertentu.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - message: string
  - log: object EmailLog (baru)

# Dokumentasi API Users

Base path: `/users`

## GET /users/me

- Deskripsi: Mengambil informasi user saat ini.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - object User:
    - id, username, role, daily_quota, used_today, last_reset_date, group, nomer_hp, email

## PATCH /users/me/password

- Deskripsi: Mengubah password sendiri.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - currentPassword: string (wajib)
  - newPassword: string (wajib)
- Response (JSON):
  - message: string

## GET /users

- Deskripsi: Mengambil daftar user.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - array of object User:
    - id, username, role, daily_quota, group, nomer_hp, email, hasSmtp

## POST /users

- Deskripsi: Membuat user baru.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - username: string (wajib)
  - password: string (wajib)
  - role: "user" | "admin"
  - group: string (opsional)
  - nomer_hp: string (opsional)
  - email: string (opsional)
- Response (JSON):
  - message: string

## POST /users/import

- Deskripsi: Import user dari array records.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - records: array of object
    - username: string (wajib)
    - group: string (wajib)
    - nomer_hp: string (wajib)
    - email: string (wajib, valid)
- Response (JSON):
  - message: string

## POST /users/bulk-delete

- Deskripsi: Menghapus banyak user sekaligus.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - ids: number[] (wajib)
- Response (JSON):
  - message: string
  - deleted: number
  - skipped: number

## PATCH /users/:id/password

- Deskripsi: Reset password user tertentu.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - password: string (wajib) atau newPassword: string (wajib)
- Response (JSON):
  - message: string

## PATCH /users/:id/role

- Deskripsi: Mengubah role user.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - role: "user" | "admin" (wajib)
- Response (JSON):
  - message: string
  - user: object
    - id: number
    - role: "user" | "admin"

## DELETE /users/:id

- Deskripsi: Menghapus satu user (bukan diri sendiri, bukan admin).
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - message: string

# Dokumentasi API Assignments

Base path: `/assignments`

## GET /assignments/me

- Deskripsi: Mengambil daftar penugasan milik user saat ini.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - array of object Assignment:
    - id: number
    - badan_publik_id: number
    - badanPublik: object
      - id, nama_badan_publik, kategori, email

## GET /assignments

- Deskripsi: Mengambil daftar penugasan terbaru per badan publik (admin).
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - array of object Assignment:
    - id: number
    - user_id: number
    - badan_publik_id: number
    - user: object
      - id, username, role
    - badanPublik: object
      - id, nama_badan_publik, kategori

## GET /assignments/:userId

- Deskripsi: Mengambil daftar penugasan untuk satu user (admin).
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - array of object Assignment:
    - id: number
    - user_id: number
    - badan_publik_id: number
    - badanPublik: object
      - id, nama_badan_publik, kategori

## POST /assignments

- Deskripsi: Menetapkan daftar badan publik ke satu user (menggantikan yang ada) (admin).
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - user_id: number (wajib)
  - badan_publik_ids: number[] (wajib)
- Response (JSON):
  - message: string
  - total: number

# Dokumentasi API Quota

Base path: `/quota`

## GET /quota/me

- Deskripsi: Mengambil informasi kuota harian user saat ini.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - daily_quota: number
  - used_today: number
  - remaining: number

## GET /quota/my-requests

- Deskripsi: Mengambil daftar permintaan kuota milik user saat ini.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - array of object QuotaRequest:
    - id, user_id, requested_quota, reason, status, admin_note, responded_at, response_minutes, createdAt, updatedAt

## POST /quota/request

- Deskripsi: Membuat permintaan penambahan kuota.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - requested_quota: number (wajib)
  - reason: string (opsional)
- Response (JSON):
  - message: string
  - request: object QuotaRequest

## GET /quota/requests

- Deskripsi: Mengambil semua permintaan kuota (admin).
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - array of object QuotaRequest:
    - id, user_id, requested_quota, reason, status, admin_note, responded_at, response_minutes, createdAt, updatedAt
    - user: object
      - username, role

## PATCH /quota/requests/:id

- Deskripsi: Menyetujui atau menolak permintaan kuota (admin).
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - status: "approved" | "rejected" (wajib)
  - admin_note: string (opsional)
- Response (JSON):
  - message: string
  - request: object QuotaRequest (terbarui)

## PATCH /quota/user/:userId

- Deskripsi: Mengatur kuota harian untuk user tertentu (admin).
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - daily_quota: number (wajib, > 0)
- Response (JSON):
  - message: string
  - daily_quota: number

# Dokumentasi API Holidays

Base path: `/holidays`

## GET /holidays

- Deskripsi: Mengambil daftar libur.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - array of object Holiday:
    - id, date (YYYY-MM-DD), name, createdAt, updatedAt

## POST /holidays

- Deskripsi: Menambah libur baru.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - date: string (YYYY-MM-DD) (wajib)
  - name: string (wajib)
- Response (JSON):
  - object Holiday (terbuat)

## DELETE /holidays/:id

- Deskripsi: Menghapus satu libur.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - message: string

# Dokumentasi API News

Base path: `/news`

## GET /news/kip

- Deskripsi: Mengambil daftar berita terkait Keterbukaan Informasi Publik (KIP) dari berbagai sumber RSS, hingga 40 item terbaru dalam 30 hari terakhir.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: Admin.
- Request:
  - Query (opsional):
    - refresh: "1" | "true"
    - force: "1" | "true"
- Response (JSON):
  - array of object:
    - title: string
    - link: string
    - summary: string
    - publishedAt: string (ISO)

# Dokumentasi API Reports

Base path: `/api/reports`

## GET /api/reports/me

- Deskripsi: Mengambil daftar laporan milik user saat ini.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - array of object UjiAksesReport:
    - id, badan_publik_id, status, total_skor, answers, evidences, submitted_at, createdAt, updatedAt
    - badanPublik: object
      - id, nama_badan_publik, kategori, email

## GET /api/reports/:id

- Deskripsi: Mengambil detail satu laporan beserta rubric pertanyaan.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - report: object UjiAksesReport
    - id, user_id, badan_publik_id, status, total_skor, answers, evidences, submitted_at, createdAt, updatedAt
    - user: object
      - id, username, role
    - badanPublik: object
      - id, nama_badan_publik, kategori, email, website (opsional)
  - rubric: array of object
    - key, section, text, order
    - options: array of object
      - key, label, score, order

## POST /api/reports

- Deskripsi: Membuat laporan baru untuk satu badan publik.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - badanPublikId: number (wajib) atau badan_publik_id: number (wajib)
  - answers: object (opsional)
- Response (JSON):
  - object UjiAksesReport

## GET /api/reports/by-badan/:badanPublikId

- Deskripsi: Mengambil laporan user saat ini berdasarkan badan publik (jika ada).
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - report: object UjiAksesReport | null

## PATCH /api/reports/:id/submit

- Deskripsi: Simpan/submit laporan (tetap dapat diedit).
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - answers: object (opsional)
- Response (JSON):
  - object UjiAksesReport

## POST /api/reports/:id/upload

- Deskripsi: Upload bukti (evidence) untuk satu pertanyaan.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (multipart/form-data):
  - questionKey: string (wajib)
  - files: file[] (maks 2; pdf/jpg/jpeg/png; maks 2MB per file)
- Response (JSON):
  - evidences: object

## DELETE /api/reports/:id/evidence

- Deskripsi: Hapus satu file bukti untuk pertanyaan tertentu.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: tidak perlu.
- Request (JSON):
  - questionKey: string (wajib)
  - path: string (wajib, format "/uploads/...")
- Response (JSON):
  - evidences: object

# Dokumentasi API Admin Reports

Base path: `/api/admin/reports`

## GET /api/admin/reports

- Deskripsi: Mengambil daftar laporan dengan opsi pencarian, filter, dan sorting (admin).
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: Admin.
- Request:
  - Query (opsional):
    - q: string (pencarian nama badan publik/kategori)
    - badanPublikId: number
    - status: "submitted"
    - sortBy: "total_skor" | "createdAt"
    - sortDir: "asc" | "desc"
- Response (JSON):
  - array of object UjiAksesReport:
    - id, user_id, badan_publik_id, status, total_skor, answers, evidences, submitted_at, createdAt, updatedAt
    - user: object
      - id, username, role
    - badanPublik: object
      - id, nama_badan_publik, kategori, email

## POST /api/admin/reports/bulk-delete

- Deskripsi: Menghapus banyak laporan sekaligus (admin).
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - ids: number[] (wajib)
- Response (JSON):
  - message: string
  - deleted: number

## GET /api/admin/reports/:id

- Deskripsi: Mengambil detail satu laporan beserta rubric pertanyaan (admin).
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - report: object UjiAksesReport
    - id, user_id, badan_publik_id, status, total_skor, answers, evidences, submitted_at, createdAt, updatedAt
    - user: object
      - id, username, role
    - badanPublik: object
      - id, nama_badan_publik, kategori, email, website (opsional)
  - rubric: array of object
    - key, section, text, order
    - options: array of object
      - key, label, score, order

# Dokumentasi API Uji Akses Questions

Base path: `/uji-akses/questions`

## GET /uji-akses/questions

- Deskripsi: Mengambil daftar pertanyaan uji akses beserta opsi.
- Auth: perlu.
- CSRF: tidak perlu.
- CheckRole: tidak perlu.
- Request: -
- Response (JSON):
  - array of object Question:
    - id, key, section, text, order
    - options: array of object
      - id, key, label, score, order

## POST /uji-akses/questions

- Deskripsi: Membuat pertanyaan baru dengan opsi jawaban.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - text: string (wajib)
  - section: string (opsional)
  - order: number (opsional)
  - options: array of object (wajib)
    - label: string (wajib)
    - score: number (wajib)
    - order: number (opsional)
    - key: string (opsional)
- Response (JSON):
  - object Question (terbuat)
    - id, key, section, text, order
    - options: array of object
      - id, key, label, score, order

## POST /uji-akses/questions/reset

- Deskripsi: Reset pertanyaan uji akses ke template bawaan.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - message: string
  - count: number

## PUT /uji-akses/questions/:id

- Deskripsi: Memperbarui pertanyaan dan opsi jawaban.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request (JSON):
  - text: string (wajib)
  - section: string (opsional)
  - order: number (opsional)
  - options: array of object (wajib)
    - id: number (opsional; untuk opsi yang diperbarui)
    - key: string (opsional)
    - label: string (wajib)
    - score: number (wajib)
    - order: number (opsional)
- Response (JSON):
  - object Question (terbarui)
    - id, key, section, text, order
    - options: array of object
      - id, key, label, score, order

## DELETE /uji-akses/questions/all

- Deskripsi: Menghapus semua pertanyaan uji akses beserta semua opsi.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - message: string

## DELETE /uji-akses/questions/:id

- Deskripsi: Menghapus satu pertanyaan beserta opsinya.
- Auth: perlu.
- CSRF: perlu.
- CheckRole: Admin.
- Request: -
- Response (JSON):
  - message: string
