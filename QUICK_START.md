# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install & Configure (2 min)
```bash
npm install
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=change-this-to-a-long-random-string
RESEND_API_KEY=re_your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=another-random-string
```

### 2. Start MongoDB (1 min)
```bash
# macOS
brew services start mongodb-community

# Or use MongoDB Atlas (cloud) - see SETUP.md
```

### 3. Run the App (1 min)
```bash
npm run dev
```

Open http://localhost:3000

### 4. Create Account (1 min)
1. Click "Sign up"
2. Enter email and password
3. Check email for OTP
4. Enter OTP code
5. Start tracking jobs!

## 📋 Common Tasks

### Add a Job
Dashboard → Jobs → + Add Job

### Move Job to Next Stage
Pipeline → Drag job card to new column

### Set a Reminder
Jobs → Click job → + Add Reminder

### Customize Stages
Settings → + Add Stage

## 🔧 Troubleshooting

**Can't connect to MongoDB?**
```bash
mongosh  # Test connection
```

**Email not sending?**
- Check Resend API key
- Verify email in Resend dashboard

**Build errors?**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 📚 Full Documentation
- [README.md](README.md) - Complete overview
- [SETUP.md](SETUP.md) - Detailed setup guide
- [FEATURES.md](FEATURES.md) - Feature checklist

## 🎯 What's Next?
1. Add your first job application
2. Set up a reminder
3. Try the drag-and-drop pipeline
4. Customize your stages
5. Check the calendar view

Happy job hunting! 🎉
