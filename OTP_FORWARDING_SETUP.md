# OTP Email Forwarding - Test Mode

## What This Does

All OTP emails are now forwarded to your verified email (`gauravsapkal1997@gmail.com`), but the email body shows who requested the OTP.

## How It Works

### When Someone Registers

**Example: User registers with `john@example.com`**

1. **Email sent to**: `gauravsapkal1997@gmail.com` (your verified email)
2. **Subject**: `OTP for john@example.com - Job Tracker`
3. **Email body shows**:
   ```
   🧪 Test Mode
   OTP requested by: john@example.com
   
   Your OTP code is:
   123456
   
   Note: This email was sent to you because domain verification 
   is pending. In production, this will be sent to john@example.com
   ```

### When You Register

**Example: You register with `gauravsapkal1997@gmail.com`**

1. **Email sent to**: `gauravsapkal1997@gmail.com`
2. **Subject**: `Your OTP for Job Tracker`
3. **Email body shows**:
   ```
   Verify Your Email
   
   Your OTP code is:
   123456
   
   This code will expire in 10 minutes.
   ```

## Benefits

✅ **Test with any email** - Register with any email address
✅ **Receive all OTPs** - All OTPs come to your inbox
✅ **Know who registered** - Email shows original requester
✅ **No domain needed** - Works without domain verification
✅ **Easy testing** - Perfect for development and testing

## Usage

### Testing Different Users

1. **Register User 1**:
   - Email: `user1@test.com`
   - Check your inbox: `gauravsapkal1997@gmail.com`
   - Email shows: "OTP requested by: user1@test.com"
   - Use OTP to verify

2. **Register User 2**:
   - Email: `user2@test.com`
   - Check your inbox: `gauravsapkal1997@gmail.com`
   - Email shows: "OTP requested by: user2@test.com"
   - Use OTP to verify

3. **Register yourself**:
   - Email: `gauravsapkal1997@gmail.com`
   - Check your inbox
   - Normal OTP email (no test mode banner)

## Email Examples

### Test Mode Email (for other users)

```
┌─────────────────────────────────────────┐
│ 🧪 Test Mode                            │
│ OTP requested by: alice@example.com     │
└─────────────────────────────────────────┘

Verify Your Email

Someone registered with email alice@example.com

Your OTP code is:

┌─────────────────┐
│    654321       │
└─────────────────┘

This code will expire in 10 minutes.

┌─────────────────────────────────────────┐
│ Note: This email was sent to you        │
│ because domain verification is pending. │
│ In production, this will be sent to     │
│ alice@example.com                       │
└─────────────────────────────────────────┘
```

### Normal Email (for your email)

```
Verify Your Email

Your OTP code is:

┌─────────────────┐
│    123456       │
└─────────────────┘

This code will expire in 10 minutes.

If you didn't request this code, 
please ignore this email.
```

## Configuration

### Environment Variable

The verified email is set in `.env.local`:

```env
RESEND_VERIFIED_EMAIL=gauravsapkal1997@gmail.com
```

**To change it:**
1. Update `.env.local`
2. Restart dev server
3. All OTPs will go to new email

### For Vercel Deployment

Add environment variable in Vercel:
1. Dashboard → Your Project
2. Settings → Environment Variables
3. Add:
   - Name: `RESEND_VERIFIED_EMAIL`
   - Value: `gauravsapkal1997@gmail.com`
4. Redeploy

## Console Logs

The server also logs OTP information:

```
Attempting to send OTP email to: user@test.com
OTP: 123456
Resend API Key configured: true
OTP email sent successfully to: gauravsapkal1997@gmail.com
Original recipient: user@test.com
```

## Testing Workflow

### Complete Test Flow

1. **Open app**: `http://localhost:3000`

2. **Register new user**:
   - Click "Sign up"
   - Email: `testuser@example.com`
   - Password: `password123`
   - Confirm password: `password123`
   - Click "Sign Up"

3. **Check your email**: `gauravsapkal1997@gmail.com`
   - Subject: "OTP for testuser@example.com - Job Tracker"
   - Body shows: "OTP requested by: testuser@example.com"
   - Copy the OTP (6 digits)

4. **Verify OTP**:
   - Enter the OTP
   - Click "Verify Email"
   - Redirected to dashboard

5. **Test features**:
   - Add jobs
   - Set reminders
   - Use pipeline
   - Everything works!

## Switching to Production

When you verify a domain:

1. **Update `lib/resend.js`**:
   ```javascript
   // Remove the forwarding logic
   const sendTo = email; // Send to actual recipient
   ```

2. **Or keep the logic**:
   The code automatically detects if email matches verified email:
   ```javascript
   const isTestMode = email !== sendTo;
   ```
   
   When domain is verified and you send to actual emails,
   `isTestMode` will be `false` and normal emails are sent.

## Advantages Over Console OTP

### Before (Console OTP)
- ❌ Need to check server logs
- ❌ Hard to find OTP in logs
- ❌ Can't test email delivery
- ❌ No email formatting test

### After (Email Forwarding)
- ✅ All OTPs in your inbox
- ✅ Easy to find and copy
- ✅ Tests actual email delivery
- ✅ Tests email formatting
- ✅ Tests Resend integration
- ✅ Know who requested OTP

## Security Note

This is safe because:
- Only works with your verified Resend email
- OTPs still expire in 10 minutes
- Each OTP is unique per user
- Shows who requested the OTP
- Only for development/testing

## Troubleshooting

### Not receiving emails?

1. **Check spam folder**
2. **Verify RESEND_API_KEY is set**
3. **Check server logs for errors**
4. **Verify RESEND_VERIFIED_EMAIL is correct**

### Wrong email receiving OTPs?

1. Check `.env.local`:
   ```env
   RESEND_VERIFIED_EMAIL=gauravsapkal1997@gmail.com
   ```
2. Restart dev server
3. Try again

### OTP not working?

1. Make sure you're using the OTP from the latest email
2. OTPs expire in 10 minutes
3. Each registration generates a new OTP
4. Check the email shows correct requester

## Summary

✅ **Now you can**:
- Register with ANY email address
- Receive ALL OTPs in your inbox
- See who requested each OTP
- Test the complete flow
- No domain verification needed

✅ **Perfect for**:
- Development
- Testing
- Demo
- MVP launch

✅ **When ready for production**:
- Verify domain in Resend
- Update sender email
- Remove test mode logic (optional)

---

**Status**: ✅ Working
**Test it**: Register with any email, check `gauravsapkal1997@gmail.com`
**Production**: Verify domain when ready
