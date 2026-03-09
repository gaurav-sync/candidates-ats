# OTP Email Not Sending - Troubleshooting Guide

## Problem
Users are not receiving OTP emails during signup.

## Common Causes & Solutions

### 1. Resend API Key Not Configured

**Check if API key is set:**

**On Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Look for `RESEND_API_KEY`

**If missing:**
1. Get your API key from [resend.com](https://resend.com)
2. Add environment variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_your_api_key_here`
3. Redeploy your app

**Locally (.env.local):**
```env
RESEND_API_KEY=re_your_api_key_here
```

### 2. Invalid Resend API Key

**Symptoms:**
- Error in logs: "Invalid API key"
- Status code: 401

**Solution:**
1. Go to [resend.com](https://resend.com)
2. API Keys section
3. Create new API key
4. Copy the key (starts with `re_`)
5. Update in Vercel environment variables
6. Redeploy

### 3. Email Domain Not Verified

**For Production:**
Resend's default `onboarding@resend.dev` works for testing but has limits.

**To use your own domain:**
1. Go to Resend dashboard
2. Domains → Add Domain
3. Add your domain (e.g., `yourdomain.com`)
4. Add DNS records as shown
5. Wait for verification
6. Update `lib/resend.js`:
   ```javascript
   from: 'Job Tracker <noreply@yourdomain.com>'
   ```

### 4. Rate Limits Exceeded

**Free Tier Limits:**
- 100 emails per day
- 3,000 emails per month

**Check usage:**
1. Resend dashboard
2. Usage section
3. See how many emails sent

**Solution:**
- Upgrade to paid plan
- Or wait for limit reset (daily/monthly)

### 5. Email in Spam Folder

**Check:**
1. Look in spam/junk folder
2. Check "Promotions" tab (Gmail)
3. Check "Updates" tab (Gmail)

**Solution:**
- Add sender to contacts
- Mark as "Not Spam"
- For production, use verified domain

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to register
4. Look for errors:

**Good:**
```
Attempting registration for: user@example.com
Registration response: { message: "Registration successful..." }
Registration successful, redirecting to OTP verification
```

**Bad:**
```
Registration error: Failed to send verification email
Error: RESEND_API_KEY is not configured
```

### Step 2: Check Server Logs

**On Vercel:**
1. Dashboard → Your Project
2. Logs tab
3. Filter by `/api/auth/register`
4. Look for errors

**Locally:**
```bash
npm run dev
# Watch terminal for logs
```

**What to look for:**
```
✅ Good:
Registration attempt for: user@example.com
Creating user with OTP: 123456
User created, sending OTP email...
OTP email sent successfully: { id: "..." }

❌ Bad:
RESEND_API_KEY is not configured
Error sending OTP email: Invalid API key
Failed to send OTP email: 401 Unauthorized
```

### Step 3: Test Resend API Directly

**Manual test:**
```bash
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "onboarding@resend.dev",
    "to": ["your@email.com"],
    "subject": "Test",
    "html": "<p>Test email</p>"
  }'
```

**Expected response:**
```json
{
  "id": "abc123...",
  "from": "onboarding@resend.dev",
  "to": ["your@email.com"],
  "created_at": "2026-03-09T..."
}
```

### Step 4: Check Resend Dashboard

1. Go to [resend.com](https://resend.com)
2. Login to your account
3. Go to "Logs" section
4. See if emails are being sent
5. Check delivery status

**Status meanings:**
- ✅ **Delivered**: Email sent successfully
- ⏳ **Queued**: Being processed
- ❌ **Failed**: Check error message
- 🚫 **Bounced**: Invalid email address

## Quick Fixes

### Fix 1: Restart with Fresh API Key
```bash
# 1. Get new API key from Resend
# 2. Update Vercel environment variable
# 3. Redeploy
vercel --prod

# Or locally
# Update .env.local
# Restart dev server
npm run dev
```

### Fix 2: Test with Different Email
Some email providers block automated emails:
- Try Gmail
- Try Outlook
- Try ProtonMail
- Avoid temporary email services

### Fix 3: Use Console OTP (Development Only)
For testing, check server logs for OTP:
```
Creating user with OTP: 123456
```
Use this OTP to verify manually.

## Environment Variables Checklist

Make sure these are set:

**Vercel:**
```
RESEND_API_KEY=re_your_key_here
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Local (.env.local):**
```
RESEND_API_KEY=re_your_key_here
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Testing Checklist

- [ ] RESEND_API_KEY is set
- [ ] API key is valid (test in Resend dashboard)
- [ ] Email address is valid
- [ ] Check spam folder
- [ ] Check browser console for errors
- [ ] Check server logs for errors
- [ ] Check Resend dashboard logs
- [ ] Try different email address
- [ ] Verify rate limits not exceeded
- [ ] Restart dev server / redeploy

## Alternative: Manual OTP Entry (Development)

For development/testing, you can manually get the OTP from logs:

1. Try to register
2. Check server logs
3. Look for: `Creating user with OTP: 123456`
4. Use that OTP to verify

## Production Checklist

Before going live:

- [ ] Valid Resend API key
- [ ] Verify your domain in Resend
- [ ] Update `from` email to your domain
- [ ] Test with multiple email providers
- [ ] Monitor Resend dashboard
- [ ] Set up email alerts
- [ ] Consider paid plan for higher limits

## Common Error Messages

### "Email service not configured"
**Cause**: RESEND_API_KEY not set
**Fix**: Add API key to environment variables

### "Failed to send verification email"
**Cause**: Resend API error
**Fix**: Check API key, check Resend logs

### "Invalid API key"
**Cause**: Wrong or expired API key
**Fix**: Generate new key from Resend

### "Rate limit exceeded"
**Cause**: Too many emails sent
**Fix**: Wait or upgrade plan

### "User already exists"
**Cause**: Email already registered
**Fix**: Use different email or login

## Support Resources

- **Resend Docs**: https://resend.com/docs
- **Resend Status**: https://status.resend.com
- **Resend Support**: support@resend.com

## Quick Test Script

Save as `test-email.js`:
```javascript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function testEmail() {
  try {
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ['your@email.com'],
      subject: 'Test Email',
      html: '<p>If you receive this, Resend is working!</p>',
    });
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();
```

Run:
```bash
node test-email.js
```

---

**Most Common Fix**: Add RESEND_API_KEY to Vercel environment variables and redeploy.
