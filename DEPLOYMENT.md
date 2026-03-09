# Deployment Guide

## Pre-Deployment Checklist

### Security
- [ ] Change JWT_SECRET to a strong random string (min 32 chars)
- [ ] Set strong CRON_SECRET
- [ ] Use MongoDB Atlas with authentication
- [ ] Enable IP whitelisting in MongoDB
- [ ] Verify Resend API key is production key
- [ ] Review all environment variables
- [ ] Remove any test/debug code

### Configuration
- [ ] Update NEXT_PUBLIC_APP_URL to production URL
- [ ] Configure MongoDB connection string
- [ ] Set up Resend domain (optional but recommended)
- [ ] Test email sending
- [ ] Verify all API endpoints work

### Code Quality
- [ ] Run `npm run build` successfully
- [ ] Test all features manually
- [ ] Check responsive design
- [ ] Test authentication flow
- [ ] Verify drag-and-drop works
- [ ] Test reminder creation

## Deployment Options

### Option 1: Vercel (Recommended)

**Pros**: Easy, free tier, automatic deployments, built-in cron
**Best for**: Quick deployment, hobby projects, production apps

#### Steps:

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Configure project:
  - Framework Preset: Next.js
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: .next

3. **Add Environment Variables**
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_production_jwt_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_SECRET=your_cron_secret
```

4. **Deploy**
- Click "Deploy"
- Wait for build to complete
- Your app is live!

5. **Set Up Cron Job**

Create `vercel.json` in root:
```json
{
  "crons": [{
    "path": "/api/reminders/check",
    "schedule": "*/5 * * * *"
  }]
}
```

Push changes:
```bash
git add vercel.json
git commit -m "Add cron job"
git push
```

### Option 2: Railway

**Pros**: Simple, supports MongoDB, good free tier
**Best for**: Full-stack apps with database

#### Steps:

1. **Create Railway Account**
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

2. **Create New Project**
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repository

3. **Add MongoDB**
- Click "New"
- Select "Database" → "MongoDB"
- Copy connection string

4. **Configure Environment Variables**
- Go to your app service
- Click "Variables"
- Add all environment variables

5. **Deploy**
- Railway auto-deploys on push
- Get your app URL from dashboard

6. **Set Up External Cron**
- Use [cron-job.org](https://cron-job.org)
- Create job to call `/api/reminders/check`
- Add Authorization header with CRON_SECRET

### Option 3: DigitalOcean App Platform

**Pros**: More control, good for scaling
**Best for**: Production apps, custom needs

#### Steps:

1. **Create App**
- Go to [digitalocean.com](https://digitalocean.com)
- Create new App
- Connect GitHub repository

2. **Configure Build**
- Build Command: `npm run build`
- Run Command: `npm start`

3. **Add Environment Variables**
- Add all required variables in App settings

4. **Add MongoDB**
- Use MongoDB Atlas
- Or create DigitalOcean Managed MongoDB

5. **Deploy**
- Click "Deploy"
- Wait for deployment

## MongoDB Setup (Production)

### MongoDB Atlas (Recommended)

1. **Create Cluster**
- Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Create free cluster
- Choose region close to your app

2. **Create Database User**
- Database Access → Add New User
- Choose password authentication
- Save credentials

3. **Whitelist IPs**
- Network Access → Add IP Address
- For Vercel: Add `0.0.0.0/0` (allow all)
- For specific IPs: Add your server IPs

4. **Get Connection String**
- Clusters → Connect → Connect your application
- Copy connection string
- Replace `<password>` with your password
- Add database name: `/job-tracker`

Example:
```
mongodb+srv://username:password@cluster.mongodb.net/job-tracker?retryWrites=true&w=majority
```

## Resend Setup (Production)

1. **Verify Domain** (Optional but recommended)
- Go to Resend dashboard
- Add your domain
- Add DNS records
- Verify domain

2. **Update Email Sender**
In `lib/resend.js`, change:
```javascript
from: 'Job Tracker <noreply@yourdomain.com>'
```

3. **Test Emails**
- Send test email from Resend dashboard
- Verify delivery

## Post-Deployment

### Testing
- [ ] Register new account
- [ ] Verify OTP email received
- [ ] Login successfully
- [ ] Create job application
- [ ] Test drag-and-drop
- [ ] Create reminder
- [ ] Check calendar view
- [ ] Test all CRUD operations

### Monitoring
- [ ] Check Vercel/Railway logs
- [ ] Monitor MongoDB usage
- [ ] Check Resend email logs
- [ ] Test cron job execution
- [ ] Monitor error rates

### Performance
- [ ] Test page load times
- [ ] Check mobile responsiveness
- [ ] Verify API response times
- [ ] Monitor database queries

## Troubleshooting

### Build Fails
```bash
# Locally test build
npm run build

# Check for errors
# Fix issues
# Push changes
```

### Database Connection Issues
- Verify connection string
- Check IP whitelist
- Verify user credentials
- Test connection with MongoDB Compass

### Email Not Sending
- Check Resend API key
- Verify domain (if using custom domain)
- Check Resend logs
- Test with different email

### Cron Job Not Running
- Verify cron configuration
- Check Authorization header
- Test endpoint manually
- Review logs

## Scaling Considerations

### Database
- Monitor connection pool
- Add indexes for frequently queried fields
- Consider read replicas for high traffic

### API
- Implement rate limiting
- Add caching for frequently accessed data
- Use CDN for static assets

### Email
- Monitor Resend usage limits
- Consider email queue for high volume
- Implement retry logic

## Backup Strategy

### Database Backups
- MongoDB Atlas: Automatic backups enabled
- Manual: Use `mongodump` regularly
- Test restore process

### Code Backups
- GitHub repository (primary)
- Local backups
- Tag releases

## Security Best Practices

- [ ] Use HTTPS only
- [ ] Enable CORS properly
- [ ] Implement rate limiting
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated
- [ ] Regular security audits
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication

## Cost Estimates

### Free Tier (Hobby)
- Vercel: Free
- MongoDB Atlas: Free (512MB)
- Resend: Free (100 emails/day)
- **Total: $0/month**

### Production (Small)
- Vercel Pro: $20/month
- MongoDB Atlas: $9/month (2GB)
- Resend: $20/month (50k emails)
- **Total: ~$49/month**

## Support & Maintenance

### Regular Tasks
- Monitor error logs weekly
- Check email delivery rates
- Review user feedback
- Update dependencies monthly
- Backup database weekly
- Test critical features monthly

### Updates
```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Fix vulnerabilities
npm audit fix
```

## Success Metrics

Track these metrics:
- User registrations
- Active users
- Jobs tracked
- Reminders set
- Email delivery rate
- Page load times
- Error rates
- User retention

---

**Ready to deploy? Follow the checklist and you'll be live in minutes!**
