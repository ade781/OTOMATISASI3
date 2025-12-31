# Sistem Otomatisasi Email & Uji Akses

Aplikasi web full-stack untuk otomasi pengiriman email dan manajemen uji akses informasi publik dengan fitur authentication, role-based access control, dan integrasi SMTP.

## 📋 Daftar Isi

- [Stack Teknologi](#stack-teknologi)
- [Kebutuhan Sistem untuk Deployment](#kebutuhan-sistem-untuk-deployment)
- [Environment Variables](#environment-variables)
- [Instalasi Lokal](#instalasi-lokal)
- [Deployment ke VPS/PaaS](#deployment-ke-vpspaas)
- [Konfigurasi Domain di Cloudflare](#konfigurasi-domain-di-cloudflare)

## 🛠 Stack Teknologi

### Backend
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database**: MySQL/MariaDB
- **ORM**: Sequelize
- **Authentication**: JWT (Access Token + Refresh Token)
- **Security**: Helmet, CORS, bcrypt, Cloudflare Turnstile
- **Email**: Nodemailer dengan Gmail SMTP
- **File Upload**: Multer
- **Logging**: Winston dengan Daily Rotate File

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **PDF Generation**: jsPDF
- **Excel Export**: xlsx

## 🖥 Kebutuhan Sistem untuk Deployment

### Minimum Requirements (VPS/PaaS)

#### Spesifikasi Server
- **CPU**: 2 vCPU / 2 Core
- **RAM**: 2 GB (minimal), 4 GB (recommended)
- **Storage**: 20 GB SSD (minimal)
  - 5 GB untuk sistem operasi
  - 5 GB untuk aplikasi dan dependencies
  - 5 GB untuk database
  - 5 GB untuk uploads dan logs
- **Bandwidth**: 1 TB/bulan (tergantung traffic)
- **OS**: Ubuntu 20.04/22.04 LTS atau Debian 11/12

#### Software Requirements
- **Node.js**: v20.x LTS
- **npm**: v10.x (included with Node.js)
- **MySQL/MariaDB**: v8.0+ / v10.6+
- **Nginx** atau **Apache**: sebagai reverse proxy
- **PM2**: untuk process management (recommended)
- **Docker** (opsional): jika menggunakan containerization
- **SSL/TLS**: Let's Encrypt (via Certbot)

### Recommended Production Setup (VPS)

#### Spesifikasi yang Direkomendasikan
- **CPU**: 4 vCPU
- **RAM**: 8 GB
- **Storage**: 50-100 GB SSD
  - 10 GB untuk sistem operasi
  - 10 GB untuk aplikasi
  - 20 GB untuk database
  - 10-50 GB untuk uploads dan logs
- **Bandwidth**: 2-5 TB/bulan

#### Load Estimation
Setup di atas dapat menangani:
- **Concurrent Users**: 50-100 users
- **Email per Hari**: 5,000-10,000 emails
- **File Storage**: Bergantung pada ukuran laporan dan attachment
- **Database Records**: 100,000+ records

### Platform as a Service (PaaS) Options

Aplikasi ini kompatibel dengan platform berikut:

#### 1. **Railway.app / Render.com**
- **Plan**: Starter/Pro
- **Specs**: 2 GB RAM, 2 vCPU
- **Database**: MySQL addon (min 1 GB)
- **Storage**: Persistent disk untuk uploads
- **Cost**: ~$15-25/month

#### 2. **DigitalOcean App Platform**
- **Plan**: Basic
- **Specs**: 1 GB RAM, 1 vCPU (upgrade ke 2 GB recommended)
- **Database**: Managed MySQL (min 1 GB RAM)
- **Storage**: Spaces untuk file uploads
- **Cost**: ~$20-40/month

#### 3. **AWS (Lightsail/EC2)**
- **Instance**: t3.small atau t3.medium
- **Database**: RDS MySQL (db.t3.micro minimal)
- **Storage**: EBS volume 20-50 GB
- **CDN**: CloudFront (optional)
- **Cost**: ~$20-50/month

#### 4. **Google Cloud Platform (Cloud Run + Cloud SQL)**
- **Backend/Frontend**: Cloud Run (min 1 vCPU, 2 GB RAM)
- **Database**: Cloud SQL MySQL (db-f1-micro atau db-g1-small)
- **Storage**: Cloud Storage untuk uploads
- **Cost**: ~$25-50/month (pay-per-use)

#### 5. **Heroku**
- **Dynos**: Standard 1X atau 2X
- **Database**: JawsDB MySQL atau ClearDB
- **Storage**: AWS S3 addon untuk uploads
- **Cost**: ~$25-50/month

#### 6. **VPS Providers (Manual Setup)**
- **DigitalOcean Droplets**: $12-24/month (2-4 GB RAM)
- **Vultr**: $12-24/month
- **Linode/Akamai**: $12-24/month
- **Contabo**: €5-15/month (EU-based)
- **Hostinger VPS**: $5-20/month

### Storage Considerations

#### Database Storage
- **Initial Size**: ~50-100 MB (schema + seed data)
- **Growth Rate**: 
  - ~10-50 MB per 1,000 users
  - ~5-10 MB per 1,000 emails logged
  - ~50-200 MB per 1,000 uji akses reports (with metadata)

#### File Uploads Storage
- **Uji Akses Reports**: PDF files (avg 500 KB - 2 MB each)
- **Email Attachments**: Varied sizes
- **Log Files**: Winston logs (~10-50 MB/month dengan rotation)
- **Recommendation**: Gunakan object storage (S3, Spaces, GCS) untuk production

### Scaling Recommendations

Upgrade ketika mengalami:
- CPU usage > 70% sustained
- RAM usage > 80%
- Database size > 80% storage quota
- Response time > 2 seconds
- Disk I/O bottleneck

Pertimbangkan horizontal scaling untuk:
- Load balancing multiple backend instances
- Database read replicas
- Redis untuk session/cache management
- CDN untuk static assets

## 🔐 Environment Variables

### Backend (.env)

Buat file `backend/.env` dengan konfigurasi berikut:

```bash
# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=https://your-domain.com

# Database Configuration
DB_NAME=otomasi_db
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_db_password
DB_HOST=localhost
DB_PORT=3306

# JWT Authentication
ACCESS_TOKEN_SECRET=your_access_token_secret_min_32_chars
REFRESH_TOKEN_HASH_SECRET=your_refresh_token_secret_min_32_chars

# Admin Seed (untuk setup awal)
SEED_ADMIN_USERNAME=admin
SEED_ADMIN_PASSWORD=your_secure_admin_password

# Cloudflare Turnstile (CAPTCHA)
TURNSTILE_SECRET=your_turnstile_secret_key

# Logging
LOG_LEVEL=info
```

#### Cara Generate Secret Keys

Gunakan salah satu metode berikut:

**Method 1: Node.js (Recommended)**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 2: OpenSSL**
```bash
openssl rand -base64 32
```

**Method 3: PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Frontend (.env)

Buat file `frontend/.env`:

```bash
# API Backend URL
VITE_API_URL=https://api.your-domain.com

# Cloudflare Turnstile (CAPTCHA)
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
```

### Database Setup

1. **Buat Database MySQL**:
```sql
CREATE DATABASE otomasi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'otomasi_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON otomasi_db.* TO 'otomasi_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Atau menggunakan remote database**:
```sql
CREATE USER 'otomasi_user'@'%' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON otomasi_db.* TO 'otomasi_user'@'%';
```

### SMTP Configuration

Aplikasi menggunakan Gmail SMTP. Setup Gmail App Password:

1. Aktifkan 2-Factor Authentication di akun Gmail
2. Buka https://myaccount.google.com/apppasswords
3. Generate App Password untuk "Mail"
4. Simpan App Password (16 karakter tanpa spasi)
5. Konfigurasi via UI aplikasi setelah login sebagai admin

## 💻 Instalasi Lokal

### Prerequisites
- Node.js v20.x
- MySQL 8.0+ atau MariaDB 10.6+
- npm v10.x

### Langkah-langkah

1. **Clone Repository**
```bash
git clone <repository-url>
cd OTOMATISASI3
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi Anda
npm run start
```

3. **Setup Frontend** (terminal baru)
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env dengan VITE_API_URL
npm run dev
```

4. **Akses Aplikasi**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

5. **Login Default**
- Username: admin (atau sesuai SEED_ADMIN_USERNAME)
- Password: admin*# (atau sesuai SEED_ADMIN_PASSWORD)

### Menggunakan Docker Compose

```bash
# Pastikan Docker dan Docker Compose terinstall
docker-compose up -d

# Cek logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🚀 Deployment ke VPS/PaaS

### A. Deployment ke VPS (Manual Setup)

#### 1. Persiapan Server

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install Nginx
sudo apt install -y nginx

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

#### 2. Clone dan Setup Aplikasi

```bash
# Clone repository
cd /var/www
sudo git clone <repository-url> otomasi
cd otomasi

# Setup backend
cd backend
sudo npm ci --production
sudo cp .env.example .env
sudo nano .env  # Edit environment variables

# Setup frontend
cd ../frontend
sudo npm ci
sudo cp .env.example .env
sudo nano .env  # Edit VITE_API_URL

# Build frontend untuk production
sudo npm run build
```

#### 3. Setup Database

```bash
sudo mysql -u root -p

# Jalankan SQL untuk create database (lihat section Database Setup)
# Keluar dari MySQL
```

#### 4. Jalankan dengan PM2

```bash
cd /var/www/otomasi/backend

# Start backend dengan PM2
pm2 start server.js --name "otomasi-backend"

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Copy dan jalankan command yang muncul
```

#### 5. Setup Nginx sebagai Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/otomasi
```

Paste konfigurasi berikut:

```nginx
# Backend API Server
server {
    listen 80;
    server_name api.your-domain.com;

    client_max_body_size 25M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend Server
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /var/www/otomasi/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site dan restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/otomasi /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. Setup SSL dengan Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificates
sudo certbot --nginx -d your-domain.com -d www.your-domain.com -d api.your-domain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

#### 7. Setup Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### B. Deployment ke Railway.app

1. **Persiapan Repository**
   - Push code ke GitHub/GitLab
   - Pastikan ada file `railway.toml` (opsional)

2. **Setup di Railway**
   - Login ke https://railway.app
   - Klik "New Project" → "Deploy from GitHub"
   - Pilih repository Anda

3. **Tambah Services**
   - **Backend Service**: 
     - Root directory: `/backend`
     - Build command: `npm ci`
     - Start command: `node server.js`
   - **Frontend Service**:
     - Root directory: `/frontend`
     - Build command: `npm ci && npm run build`
     - Start command: `npm run preview` atau gunakan static serve

4. **Tambah MySQL Database**
   - Klik "New" → "Database" → "Add MySQL"
   - Copy connection details ke backend environment variables

5. **Set Environment Variables**
   - Backend: Set semua vars dari `.env`
   - Frontend: Set `VITE_API_URL` ke URL backend Railway

6. **Custom Domain**
   - Settings → Domains → Add custom domain
   - Ikuti instruksi DNS configuration

### C. Deployment ke DigitalOcean App Platform

1. **Create New App**
   - Dashboard → Apps → Create App
   - Connect GitHub repository

2. **Configure Components**
   - **Backend**:
     - Type: Web Service
     - Source: `/backend`
     - Build: `npm ci`
     - Run: `node server.js`
     - Port: 5000
   
   - **Frontend**:
     - Type: Static Site
     - Source: `/frontend`
     - Build: `npm ci && npm run build`
     - Output: `dist`

3. **Add Database**
   - Add Resource → Database → MySQL
   - Link to backend service

4. **Environment Variables**
   - Configure di App Settings → Environment Variables
   - Use `${db.DATABASE_URL}` untuk database connection

5. **Custom Domain**
   - Settings → Domains → Add Domain
   - Update DNS records di Cloudflare

## ☁️ Konfigurasi Domain di Cloudflare

### Langkah 1: Tambahkan Domain ke Cloudflare

1. **Login ke Cloudflare**
   - Buka https://dash.cloudflare.com
   - Login dengan akun Anda

2. **Tambah Site**
   - Klik "Add a Site"
   - Masukkan domain Anda (contoh: `your-domain.com`)
   - Pilih plan (Free plan sudah cukup)
   - Klik "Add Site"

3. **Update Nameservers**
   - Cloudflare akan memberikan 2 nameservers
   - Login ke domain registrar Anda (Namecheap, GoDaddy, dll)
   - Update nameservers domain Anda dengan nameservers Cloudflare
   - Contoh:
     ```
     bart.ns.cloudflare.com
     roxy.ns.cloudflare.com
     ```
   - Tunggu propagasi DNS (5 menit - 48 jam)

### Langkah 2: Konfigurasi DNS Records

Setelah domain aktif di Cloudflare:

#### A. Untuk VPS dengan IP Statis

1. **Tambah A Record untuk Domain Utama**
   - DNS → Records → Add record
   - Type: `A`
   - Name: `@` (atau domain utama)
   - IPv4 address: `IP_VPS_ANDA`
   - Proxy status: ✅ Proxied (orange cloud)
   - TTL: Auto
   - Klik "Save"

2. **Tambah A Record untuk Subdomain WWW**
   - Type: `A`
   - Name: `www`
   - IPv4 address: `IP_VPS_ANDA`
   - Proxy status: ✅ Proxied
   - Klik "Save"

3. **Tambah A Record untuk API Backend**
   - Type: `A`
   - Name: `api`
   - IPv4 address: `IP_VPS_ANDA`
   - Proxy status: ✅ Proxied
   - Klik "Save"

#### B. Untuk PaaS (Railway, Render, DigitalOcean)

1. **Tambah CNAME Record untuk Domain Utama**
   - Type: `CNAME`
   - Name: `@` atau `www`
   - Target: `your-app.up.railway.app` (atau domain dari PaaS)
   - Proxy status: ✅ Proxied
   - Klik "Save"

2. **Tambah CNAME untuk API**
   - Type: `CNAME`
   - Name: `api`
   - Target: `your-backend.up.railway.app`
   - Proxy status: ✅ Proxied
   - Klik "Save"

> **Note**: Jika menggunakan root domain (`@`), beberapa provider tidak support CNAME pada root. Solusi:
> - Gunakan CNAME Flattening (Cloudflare support ini)
> - Atau gunakan subdomain `www` sebagai primary

### Langkah 3: Konfigurasi SSL/TLS

1. **SSL/TLS Settings**
   - SSL/TLS → Overview
   - Pilih mode: **Full (strict)** (recommended)
   - Jika menggunakan Let's Encrypt di VPS: pilih **Full**

2. **Edge Certificates**
   - SSL/TLS → Edge Certificates
   - ✅ Always Use HTTPS: ON
   - ✅ Automatic HTTPS Rewrites: ON
   - ✅ Certificate Transparency Monitoring: ON

3. **Universal SSL Certificate**
   - Otomatis diaktifkan (gratis)
   - Tunggu hingga status "Active Certificate"

### Langkah 4: Konfigurasi Cloudflare Turnstile (CAPTCHA)

Aplikasi ini menggunakan Cloudflare Turnstile untuk proteksi bot:

1. **Akses Turnstile Dashboard**
   - https://dash.cloudflare.com/?to=/:account/turnstile

2. **Create Widget**
   - Klik "Add Widget"
   - Site Name: "Otomasi App"
   - Domain: `your-domain.com`
   - Widget Mode: Managed
   - Klik "Create"

3. **Copy Keys**
   - **Site Key**: untuk frontend (`VITE_TURNSTILE_SITE_KEY`)
   - **Secret Key**: untuk backend (`TURNSTILE_SECRET`)

4. **Update Environment Variables**
   - Backend: `TURNSTILE_SECRET=your_secret_key`
   - Frontend: `VITE_TURNSTILE_SITE_KEY=your_site_key`

### Langkah 5: Optimasi Cloudflare (Optional)

#### Speed Optimizations

1. **Auto Minify**
   - Speed → Optimization
   - ✅ Auto Minify: JavaScript, CSS, HTML

2. **Brotli Compression**
   - Speed → Optimization
   - ✅ Brotli: ON

3. **Rocket Loader**
   - Speed → Optimization
   - Rocket Loader: OFF (dapat conflict dengan React)

#### Caching Rules

1. **Page Rules** (untuk static assets)
   - Rules → Page Rules → Create Page Rule
   - URL: `your-domain.com/assets/*`
   - Settings:
     - Cache Level: Cache Everything
     - Edge Cache TTL: 1 month
     - Browser Cache TTL: 1 month

2. **Cache Rules untuk API**
   - URL: `api.your-domain.com/*`
   - Cache Level: Bypass (jangan cache API responses)

#### Security Settings

1. **Firewall Rules**
   - Security → WAF → Create firewall rule
   - Block bad bots, rate limiting, etc.

2. **Rate Limiting** (opsional, berbayar)
   - Protection → Rate Limiting Rules
   - Limit requests per IP

3. **DDoS Protection**
   - Security → DDoS
   - Otomatis aktif di semua plan

### Langkah 6: Verifikasi Setup

1. **Test DNS Propagation**
   ```bash
   # Check A records
   nslookup your-domain.com
   nslookup api.your-domain.com
   
   # Check CNAME
   dig your-domain.com
   ```

2. **Test SSL**
   - Buka https://your-domain.com
   - Pastikan ada padlock icon (SSL aktif)
   - Test di: https://www.ssllabs.com/ssltest/

3. **Test Application**
   - Frontend: https://your-domain.com
   - Backend API: https://api.your-domain.com
   - Login dan test fitur utama

### Common Issues & Solutions

#### Issue: DNS tidak resolve
**Solution**: 
- Tunggu propagasi DNS (hingga 48 jam)
- Flush DNS cache lokal: `ipconfig /flushdns` (Windows) atau `sudo dscacheutil -flushcache` (Mac)
- Check DNS di https://dnschecker.org

#### Issue: SSL Error "Too Many Redirects"
**Solution**:
- Ubah SSL/TLS mode ke "Flexible" atau "Full"
- Pastikan server VPS tidak melakukan redirect loop

#### Issue: API CORS Error
**Solution**:
- Pastikan `CLIENT_URL` di backend sesuai dengan domain frontend
- Check `origin` di CORS configuration di `backend/server.js`

#### Issue: Cloudflare Turnstile Tidak Muncul
**Solution**:
- Pastikan domain di Turnstile widget settings sesuai
- Check Content Security Policy di Helmet configuration
- Pastikan `VITE_TURNSTILE_SITE_KEY` sudah di-set dengan benar

## 📝 Post-Deployment Checklist

- [ ] Database migrations telah dijalankan
- [ ] Admin user berhasil dibuat (check dengan login)
- [ ] SMTP configuration dapat di-set dan diverifikasi
- [ ] File uploads berfungsi (test upload di Uji Akses Reports)
- [ ] Email sending berfungsi (test send email)
- [ ] Cloudflare Turnstile muncul di form login
- [ ] SSL certificate aktif dan valid
- [ ] Logs dapat ditulis (check `backend/logs/`)
- [ ] PM2 restart on reboot (untuk VPS)
- [ ] Backup database telah dijadwalkan
- [ ] Monitoring telah di-setup (uptime, errors)

## 🔧 Maintenance

### Backup Database

```bash
# Manual backup
mysqldump -u otomasi_user -p otomasi_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup (add to crontab)
0 2 * * * mysqldump -u otomasi_user -pYourPassword otomasi_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz
```

### Update Application

```bash
cd /var/www/otomasi
sudo git pull origin main

# Backend
cd backend
sudo npm ci --production
pm2 restart otomasi-backend

# Frontend
cd ../frontend
sudo npm ci
sudo npm run build
```

### View Logs

```bash
# PM2 logs
pm2 logs otomasi-backend

# Application logs
tail -f /var/www/otomasi/backend/logs/combined.log
tail -f /var/www/otomasi/backend/logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Monitor Resources

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
df -h
free -h
```

## 📚 Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Cloudflare Docs](https://developers.cloudflare.com/)
- [Let's Encrypt](https://letsencrypt.org/getting-started/)

## 🐛 Troubleshooting

### Backend tidak bisa connect ke database
- Periksa credentials di `.env`
- Pastikan MySQL service running: `sudo systemctl status mysql`
- Check firewall rules: `sudo ufw status`

### Frontend tidak bisa hit API
- Periksa `VITE_API_URL` di `frontend/.env`
- Check CORS settings di `backend/server.js`
- Verify backend sedang running: `pm2 status`

### Email tidak terkirim
- Pastikan Gmail App Password sudah di-set dengan benar
- Verifikasi 2FA aktif di akun Gmail
- Check SMTP configuration di aplikasi

### PM2 tidak auto-start setelah reboot
```bash
pm2 startup
pm2 save
# Run the generated command
```

## 👥 Contributors

[-Aya Ade Wiguna / https://github.com/ade781]
[-Lyan Nandyan / https://github.com/Lyan-Nandyan]
---

**Note**: Ganti semua placeholder seperti `your-domain.com`, `IP_VPS_ANDA`, dan secret keys dengan nilai aktual Anda sebelum deployment.