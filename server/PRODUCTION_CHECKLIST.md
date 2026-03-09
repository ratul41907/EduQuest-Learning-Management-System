# 🚀 Production Deployment Checklist

Complete this checklist before deploying to production.

---

## ✅ Environment Configuration

### Required Environment Variables

- [ ] `NODE_ENV=production`
- [ ] `PORT` (e.g., 5000)
- [ ] `DATABASE_URL` (production database)
- [ ] `JWT_SECRET` (32+ random characters, CHANGE from default!)
- [ ] `REDIS_HOST` and `REDIS_PORT` (if using Redis)
- [ ] `ALLOWED_ORIGINS` (production frontend URL)
- [ ] `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`
- [ ] `FRONTEND_URL` (production frontend)

### Security

- [ ] Generate strong `JWT_SECRET`: `openssl rand -base64 32`
- [ ] Change default database password
- [ ] Remove `.env` from version control (check `.gitignore`)
- [ ] Use environment variable manager (AWS Secrets Manager, Heroku Config Vars, etc.)

---

## 🔒 Security Hardening

- [ ] Rate limiting configured (`rateLimiter.js`)
- [ ] CORS properly configured (whitelist only production domains)
- [ ] Helmet security headers enabled
- [ ] Input sanitization active (XSS, SQL injection protection)
- [ ] File upload size limits set (10MB)
- [ ] IP blocking configured for abuse
- [ ] HTTPS/SSL certificate installed (use Let's Encrypt or Cloudflare)
- [ ] Database connection uses SSL (`?sslmode=require` in DATABASE_URL)
- [ ] Remove or secure sensitive endpoints (e.g., `/analytics` admin-only)

---

## 🗄️ Database

- [ ] Production database created
- [ ] Database migrations applied: `npx prisma migrate deploy`
- [ ] Database indexes created (check `schema.prisma`)
- [ ] Database backup strategy configured
- [ ] Connection pooling configured
- [ ] Database user has minimum required permissions
- [ ] Seed data loaded (if needed): `npm run seed`

---

## 💾 Redis (Caching)

- [ ] Redis instance running
- [ ] Redis connection tested
- [ ] Redis password set (production)
- [ ] Redis persistence enabled (AOF or RDB)
- [ ] Redis maxmemory policy configured
- [ ] Cache TTLs appropriate for production

---

## 📧 Email Service

- [ ] Email service configured (Gmail, SendGrid, AWS SES, etc.)
- [ ] SMTP credentials tested
- [ ] Email templates tested
- [ ] Sender email verified
- [ ] Rate limits considered (Gmail: 500/day)
- [ ] Unsubscribe mechanism (if required)

---

## 📁 File Storage

- [ ] Uploads directory exists and writable
- [ ] File upload limits tested
- [ ] Consider cloud storage (AWS S3, Cloudinary) for scalability
- [ ] Old file cleanup strategy (if needed)

---

## 📝 Logging & Monitoring

- [ ] Winston logging configured
- [ ] Log directory exists and writable
- [ ] Log rotation working (daily files)
- [ ] Error tracking service (Sentry, LogRocket, etc.) - optional
- [ ] Application monitoring (New Relic, DataDog, PM2) - optional
- [ ] Health check endpoint tested: `GET /health`
- [ ] Uptime monitoring (UptimeRobot, Pingdom) - optional

---

## 🧪 Testing

- [ ] All unit tests passing: `npm run test:unit`
- [ ] Integration tests passing: `npm run test:integration`
- [ ] Load testing performed (optional: Artillery, k6)
- [ ] API endpoints tested with production-like data
- [ ] WebSocket connections tested
- [ ] Email sending tested

---

## 🐳 Docker (if using)

- [ ] Docker images built: `docker-compose build`
- [ ] Docker containers start successfully: `docker-compose up -d`
- [ ] All services healthy: `docker-compose ps`
- [ ] Volumes configured for data persistence
- [ ] Environment variables passed correctly
- [ ] Container logs accessible: `docker-compose logs`
- [ ] Docker networking working (containers can communicate)

---

## 🌐 Deployment Platform

### Choose your platform and complete its checklist:

#### Heroku

- [ ] Heroku app created
- [ ] Database add-on configured (Heroku Postgres)
- [ ] Redis add-on (Heroku Redis) - if needed
- [ ] Config vars set (all environment variables)
- [ ] Procfile created: `web: node src/server.js`
- [ ] Build successful
- [ ] Logs monitored: `heroku logs --tail`

#### AWS

- [ ] EC2 instance created and configured
- [ ] RDS PostgreSQL database created
- [ ] ElastiCache Redis (optional)
- [ ] Security groups configured (ports 80, 443, 5000)
- [ ] Load balancer configured (if multi-instance)
- [ ] Auto-scaling group (optional)
- [ ] CloudWatch monitoring enabled

#### DigitalOcean

- [ ] Droplet created (or App Platform app)
- [ ] Database cluster created
- [ ] Firewall rules configured
- [ ] Nginx reverse proxy configured (if using Droplet)
- [ ] PM2 process manager installed: `npm install -g pm2`
- [ ] PM2 startup script: `pm2 startup`

#### Railway / Render

- [ ] Project deployed
- [ ] Database connected
- [ ] Environment variables set
- [ ] Build successful
- [ ] Custom domain configured (optional)

---

## 🔄 Reverse Proxy (Nginx - if self-hosting)

- [ ] Nginx installed
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Nginx config created (`/etc/nginx/sites-available/eduquest`)
- [ ] Proxy pass to Node.js app (port 5000)
- [ ] Gzip compression enabled
- [ ] Rate limiting configured
- [ ] Nginx restarted: `sudo systemctl restart nginx`

**Example Nginx config:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 🚀 Deployment

- [ ] Code pushed to Git repository
- [ ] Build successful on deployment platform
- [ ] Health check passing: `curl https://yourdomain.com/health`
- [ ] API responding: `curl https://yourdomain.com/api/version`
- [ ] Database connected (check logs)
- [ ] Redis connected (check logs)
- [ ] WebSocket connections working
- [ ] File uploads working
- [ ] Emails sending

---

## 📊 Post-Deployment

- [ ] Monitor error logs for first 24 hours
- [ ] Check application performance
- [ ] Verify all features working
- [ ] Test critical user flows (register, login, enroll, quiz)
- [ ] Monitor database queries (identify slow queries)
- [ ] Check memory usage
- [ ] Check CPU usage
- [ ] Set up automated backups
- [ ] Document any production-specific configurations

---

## 🔔 Alerts & Notifications

- [ ] Server downtime alerts configured
- [ ] Error rate alerts (> 5% errors)
- [ ] Disk space alerts (> 80% full)
- [ ] Database connection alerts
- [ ] High memory usage alerts (> 90%)

---

## 📚 Documentation

- [ ] API documentation up to date
- [ ] README updated with production URLs
- [ ] Environment variable documentation complete
- [ ] Deployment runbook created
- [ ] Rollback procedure documented

---

## 🛡️ Compliance (if applicable)

- [ ] GDPR compliance (data privacy, right to deletion)
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie consent (if using cookies)
- [ ] Data retention policy

---

## ✅ Final Checks

- [ ] All endpoints tested in production
- [ ] Frontend connected to production API
- [ ] All integrations working (email, storage, etc.)
- [ ] Performance acceptable (response times < 500ms)
- [ ] No console errors in production
- [ ] Analytics/tracking configured (Google Analytics, etc.)
- [ ] SEO configured (if applicable)
- [ ] Monitoring dashboard accessible
- [ ] Team notified of deployment

---

**🎉 Production deployment complete!**

**Next Steps:**

1. Monitor for 24-48 hours
2. Collect user feedback
3. Plan next iteration
4. Celebrate! 🎊
