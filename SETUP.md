# Setup Guide - Job Application Tracker

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Your connection string:
# mongodb://localhost:27017/job-tracker
```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password

### 3. Get Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)

### 4. Configure Environment Variables

Edit `.env.local`:
```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/job-tracker
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/job-tracker

# JWT Secret (change this!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Resend API Key
RESEND_API_KEY=re_your_resend_api_key_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cron Secret (for reminder worker)
CRON_SECRET=your-random-secret-for-cron-jobs
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## First Time Usage

1. **Register**: Click "Sign up" and enter your email and password
2. **Check Email**: Look for the OTP code in your inbox (check spam!)
3. **Verify**: Enter the 6-digit OTP code
4. **Login**: You'll be automatically logged in
5. **Start Tracking**: Add your first job application!

## Features Overview

### Dashboard
- View total applications
- See pipeline breakdown
- Check upcoming reminders
- Track success rate

### Jobs Page
- Add new job applications
- Search and filter jobs
- View all application details
- Delete applications

### Pipeline (Kanban Board)
- Drag and drop jobs between stages
- Visual representation of your pipeline
- Quick status updates

### Job Detail Page
- View complete job information
- Add timeline updates (calls, emails, interviews)
- Set reminders for this job
- Track all interactions

### Calendar
- See all reminders on a calendar
- Click dates to view details
- Navigate months easily

### Reminders
- Create reminders for any job
- Mark reminders as complete
- Get email notifications
- View overdue reminders

### Settings
- Customize pipeline stages
- Add new stages
- Edit stage colors
- Delete unused stages

## Setting Up Email Reminders

### Development (Manual Testing)
```bash
# Call the reminder check endpoint manually
curl -H "Authorization: Bearer your-cron-secret-for-reminder-worker" \
  http://localhost:3000/api/reminders/check
```

### Production (Automated)

**Option 1: Vercel Cron Jobs** (Recommended if deploying to Vercel)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/reminders/check",
    "schedule": "*/5 * * * *"
  }]
}
```

**Option 2: GitHub Actions**

Create `.github/workflows/reminder-cron.yml`:
```yaml
name: Check Reminders
on:
  schedule:
    - cron: '*/5 * * * *'
jobs:
  check-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Call reminder endpoint
        run: |
          curl -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-app.vercel.app/api/reminders/check
```

**Option 3: External Cron Service**
- Use [cron-job.org](https://cron-job.org)
- Set URL: `https://your-app.com/api/reminders/check`
- Add header: `Authorization: Bearer your-cron-secret`
- Schedule: Every 5 minutes

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `RESEND_API_KEY`
  - `NEXT_PUBLIC_APP_URL` (your Vercel URL)
  - `CRON_SECRET`
- Deploy!

3. **Set up Cron Job** (see above)

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables
4. Deploy
5. Set up external cron job

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If connection fails, check your connection string
# Make sure IP is whitelisted in MongoDB Atlas
```

### Email Not Sending
- Verify Resend API key is correct
- Check Resend dashboard for errors
- Make sure "from" email is verified in Resend
- For production, add your domain to Resend

### OTP Not Received
- Check spam folder
- Verify Resend API key
- Check Resend logs
- Try with a different email

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Authentication Issues
- Clear browser localStorage
- Check JWT_SECRET is set
- Verify token is being sent in headers

## Development Tips

### Testing Email Locally
Use Resend's test mode or check their dashboard for sent emails.

### Database GUI Tools
- **MongoDB Compass**: Official MongoDB GUI
- **Studio 3T**: Advanced MongoDB client
- **MongoDB Atlas UI**: Built-in web interface

### API Testing
Use tools like:
- Postman
- Insomnia
- Thunder Client (VS Code extension)
- curl

### Hot Reload
Next.js automatically reloads when you save files. If it doesn't:
```bash
# Restart dev server
npm run dev
```

## Security Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use strong CRON_SECRET
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS in production
- [ ] Whitelist IPs in MongoDB Atlas
- [ ] Keep dependencies updated
- [ ] Don't commit .env.local to git

## Performance Tips

1. **Database Indexes**: MongoDB automatically indexes `_id`, but consider adding indexes for frequently queried fields
2. **Image Optimization**: Use Next.js Image component if adding images
3. **API Caching**: Consider caching frequently accessed data
4. **Pagination**: Add pagination for large job lists

## Customization Ideas

- Add file attachments for resumes/cover letters
- Integrate with job boards APIs
- Add interview preparation checklists
- Create email templates for follow-ups
- Add analytics and charts
- Export data to CSV/PDF
- Add team collaboration features
- Integrate with calendar apps (Google Calendar, Outlook)

## Support

If you encounter issues:
1. Check this guide
2. Review error messages in browser console
3. Check server logs
4. Verify environment variables
5. Test API endpoints individually

## Next Steps

After setup:
1. Customize default stages in Settings
2. Add your first job application
3. Set up a reminder
4. Explore the pipeline view
5. Check the calendar

Happy job hunting! 🎯
