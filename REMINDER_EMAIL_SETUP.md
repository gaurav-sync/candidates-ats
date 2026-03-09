# Reminder Email Setup Guide

## Problem
Reminders are not sending emails automatically.

## Why This Happens
The reminder system needs a **cron job** to periodically check for reminders and send emails. Without this, reminders are stored but never sent.

## Solution: Vercel Cron (Recommended)

### Step 1: Deploy with vercel.json
I've created `vercel.json` with this configuration:

```json
{
  "crons": [
    {
      "path": "/api/reminders/check",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes to check and send reminder emails.

### Step 2: Deploy to Vercel
```bash
git add vercel.json
git commit -m "Add Vercel cron for reminder emails"
git push
```

Vercel will automatically detect the cron configuration and set it up.

### Step 3: Verify Cron is Running
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Cron Jobs"
4. You should see: `/api/reminders/check` running every 5 minutes

### Step 4: Check Logs
1. In Vercel dashboard, go to "Logs"
2. Filter by `/api/reminders/check`
3. You should see logs every 5 minutes:
   ```
   Checking reminders at: 2026-03-09T...
   Found X reminders to process
   Successfully sent reminder...
   ```

## Alternative: Manual Testing

### Test the Endpoint Manually
You can manually trigger the reminder check:

```bash
# Replace with your actual Vercel URL
curl https://your-app.vercel.app/api/reminders/check
```

This will immediately check and send any pending reminders.

### From Browser
Just visit:
```
https://your-app.vercel.app/api/reminders/check
```

You should see:
```json
{
  "message": "Checked reminders, sent X",
  "sentCount": X,
  "totalFound": X,
  "timestamp": "2026-03-09T..."
}
```

## Troubleshooting

### Issue 1: Resend API Key Not Set
**Error**: "Failed to send reminder"

**Solution**: 
1. Go to Vercel dashboard
2. Settings → Environment Variables
3. Add: `RESEND_API_KEY=re_your_key_here`
4. Redeploy

### Issue 2: Cron Not Running
**Check**:
1. Vercel dashboard → Settings → Cron Jobs
2. Should show the cron job

**Fix**:
1. Make sure `vercel.json` is in root directory
2. Commit and push to trigger redeploy
3. Vercel will auto-detect and enable cron

### Issue 3: Emails Not Sending
**Check Resend Dashboard**:
1. Go to [resend.com](https://resend.com)
2. Check "Logs" section
3. See if emails are being sent

**Common Issues**:
- Invalid API key
- Email not verified in Resend
- Rate limit exceeded (free tier: 100 emails/day)

### Issue 4: Wrong Timezone
**Symptom**: Emails sent at wrong time

**Solution**: Already fixed with datetime utilities
- Reminders stored in UTC
- Displayed in user's local time
- Sent at correct time

## How It Works

### 1. User Creates Reminder
```
User sets: 4:00 PM (local time)
Stored as: 2026-03-09T21:00:00.000Z (UTC)
```

### 2. Cron Checks Every 5 Minutes
```javascript
// Runs every 5 minutes
GET /api/reminders/check

// Finds reminders where:
dateTime <= now + 5 minutes
emailSent = false
completed = false
```

### 3. Email Sent
```javascript
// For each reminder found:
1. Send email via Resend
2. Mark emailSent = true
3. Log success/failure
```

### 4. User Receives Email
```
Subject: Reminder: [Title]
Body: [Description]
Job: [Company] - [Role]
Time: [Scheduled Time]
```

## Testing Reminders

### Create a Test Reminder
1. Go to Reminders page
2. Click "+ Add Reminder"
3. Set time to **5 minutes from now**
4. Save

### Wait and Check
1. Wait 5-10 minutes
2. Check your email inbox
3. Check spam folder
4. Check Vercel logs

### Manual Trigger (Faster)
Instead of waiting, manually trigger:
```bash
curl https://your-app.vercel.app/api/reminders/check
```

Check email immediately.

## Vercel Cron Limits

### Free Plan (Hobby)
- ✅ Cron jobs supported
- ✅ Up to 1 cron job
- ✅ Minimum interval: 1 minute
- ✅ No additional cost

### Pro Plan
- ✅ Multiple cron jobs
- ✅ More frequent intervals
- ✅ Better logging

## Alternative Solutions

### Option 1: External Cron Service
If Vercel cron doesn't work, use [cron-job.org](https://cron-job.org):

1. Create free account
2. Add new cron job:
   - URL: `https://your-app.vercel.app/api/reminders/check`
   - Interval: Every 5 minutes
   - Method: GET
3. Save and enable

### Option 2: GitHub Actions
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
          curl https://your-app.vercel.app/api/reminders/check
```

### Option 3: Uptime Monitor
Use [UptimeRobot](https://uptimerobot.com):
1. Add monitor
2. URL: `https://your-app.vercel.app/api/reminders/check`
3. Interval: 5 minutes
4. Monitor type: HTTP(s)

## Monitoring

### Check if Cron is Working
Look for these in Vercel logs:

```
✅ Good:
Checking reminders at: 2026-03-09T16:00:00.000Z
Found 2 reminders to process
Successfully sent reminder 123abc
Successfully sent reminder 456def
Checked reminders, sent 2

❌ Bad:
Failed to send reminder: Invalid API key
Error: RESEND_API_KEY not set
```

### Email Delivery
Check Resend dashboard:
- Emails sent: Should increase
- Delivery rate: Should be 100%
- Bounces: Should be 0

## Environment Variables Needed

Make sure these are set in Vercel:

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
RESEND_API_KEY=re_your_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
CRON_SECRET=optional-for-manual-calls
```

## Quick Checklist

- [ ] `vercel.json` created and committed
- [ ] Pushed to GitHub/deployed to Vercel
- [ ] Cron job visible in Vercel dashboard
- [ ] `RESEND_API_KEY` set in environment variables
- [ ] Test reminder created (5 min from now)
- [ ] Waited 10 minutes
- [ ] Checked email inbox
- [ ] Checked Vercel logs
- [ ] Checked Resend dashboard

## Status Check

### Is Cron Running?
```bash
# Check Vercel logs
vercel logs --follow

# Or visit Vercel dashboard → Logs
# Filter: /api/reminders/check
```

### Are Emails Sending?
```bash
# Manual test
curl https://your-app.vercel.app/api/reminders/check

# Should return:
{
  "message": "Checked reminders, sent X",
  "sentCount": X,
  "totalFound": X
}
```

### Is Resend Working?
1. Go to [resend.com](https://resend.com)
2. Check API Keys → Make sure key is valid
3. Check Logs → See if emails are being sent
4. Check Domains → Verify domain if using custom

## Next Steps

1. **Deploy Now**:
   ```bash
   git add vercel.json app/api/reminders/check/route.js
   git commit -m "Setup reminder email cron"
   git push
   ```

2. **Verify in Vercel**:
   - Dashboard → Settings → Cron Jobs
   - Should see the cron job listed

3. **Test**:
   - Create reminder for 5 minutes from now
   - Wait 10 minutes
   - Check email

4. **Monitor**:
   - Check Vercel logs daily
   - Check Resend dashboard
   - Verify emails are being sent

---

**Status**: ✅ Configuration Ready
**Action Required**: Deploy to Vercel
**Expected Result**: Emails sent every 5 minutes for due reminders
