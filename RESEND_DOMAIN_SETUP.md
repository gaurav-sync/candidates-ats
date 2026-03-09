# Resend Domain Verification - Required for Production

## The Issue

Resend restricts unverified accounts to only send emails to the account owner's email address. 

**Current restriction:**
```
You can only send testing emails to your own email address (gauravsapkal1997@gmail.com)
```

This means:
- ✅ You can send to: `gauravsapkal1997@gmail.com`
- ❌ You cannot send to: Any other email address

## Solutions

### Option 1: Use Your Verified Email for Testing (Quick)

For immediate testing, register with your own email:

1. Go to `/register`
2. Use email: `gauravsapkal1997@gmail.com`
3. You'll receive the OTP
4. Complete registration
5. Test all features

**Pros:**
- Works immediately
- No setup required
- Good for development/testing

**Cons:**
- Only works for you
- Can't test with other users
- Not suitable for production

### Option 2: Verify a Domain (Recommended for Production)

To send emails to any address, verify a domain in Resend.

#### Step 1: Choose a Domain

You need a domain you own, for example:
- `yourdomain.com`
- `yourapp.com`
- `yourcompany.com`

Don't have a domain? Get one from:
- [Namecheap](https://www.namecheap.com) (~$10/year)
- [Google Domains](https://domains.google)
- [Cloudflare](https://www.cloudflare.com/products/registrar/)

#### Step 2: Add Domain to Resend

1. Go to [resend.com](https://resend.com)
2. Login to your account
3. Click "Domains" in sidebar
4. Click "Add Domain"
5. Enter your domain (e.g., `yourdomain.com`)
6. Click "Add"

#### Step 3: Add DNS Records

Resend will show you DNS records to add. You'll need to add these to your domain's DNS settings:

**Example records:**
```
Type: TXT
Name: _resend
Value: resend-verify=abc123...

Type: MX
Name: @
Value: feedback-smtp.resend.com
Priority: 10

Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**Where to add DNS records:**
- **Namecheap**: Dashboard → Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → DNS → Manage Zones
- **Cloudflare**: Dashboard → DNS → Records
- **Google Domains**: My Domains → DNS

#### Step 4: Wait for Verification

- DNS propagation takes 5-60 minutes
- Resend will automatically verify
- You'll see "Verified" status when ready

#### Step 5: Update Your Code

Once verified, update `lib/resend.js`:

```javascript
// Change from:
from: 'Job Tracker <onboarding@resend.dev>'

// To:
from: 'Job Tracker <noreply@yourdomain.com>'
```

**Important:** Use your verified domain in the email address!

#### Step 6: Deploy

```bash
git add lib/resend.js
git commit -m "Update email sender to verified domain"
git push
```

### Option 3: Upgrade Resend Plan

Some Resend plans have different restrictions:

**Free Plan:**
- 100 emails/day
- 3,000 emails/month
- Must verify domain for production

**Pro Plan ($20/month):**
- 50,000 emails/month
- Better deliverability
- Priority support

Check [resend.com/pricing](https://resend.com/pricing)

## Current Workaround for Development

### For Testing Locally

Since you can only send to `gauravsapkal1997@gmail.com`, here's a workaround:

**Option A: Show OTP in Console (Development Only)**

The OTP is already logged in the console:
```
Creating user with OTP: 760928
```

Users can:
1. Register with any email
2. Check server console for OTP
3. Enter OTP manually
4. Complete verification

**Option B: Skip Email Verification (Development Only)**

Create a development-only bypass (NOT for production):

```javascript
// In app/api/auth/register/route.js
if (process.env.NODE_ENV === 'development') {
  // Auto-verify in development
  user.verified = true;
  await user.save();
  
  const token = generateToken(user._id);
  return NextResponse.json({
    message: 'Auto-verified for development',
    token,
    user: { id: user._id, email: user.email },
  });
}
```

## Production Checklist

Before launching to real users:

- [ ] Domain purchased and owned
- [ ] Domain added to Resend
- [ ] DNS records configured
- [ ] Domain verified in Resend (green checkmark)
- [ ] Code updated with verified domain
- [ ] Tested email sending
- [ ] Checked spam folder
- [ ] Monitored Resend dashboard
- [ ] Set up email alerts

## Testing After Domain Verification

1. **Test with your email:**
   ```
   Register: gauravsapkal1997@gmail.com
   Should receive OTP ✅
   ```

2. **Test with different email:**
   ```
   Register: friend@gmail.com
   Should receive OTP ✅
   ```

3. **Test with multiple providers:**
   - Gmail
   - Outlook
   - Yahoo
   - ProtonMail

4. **Check deliverability:**
   - Inbox (not spam)
   - Delivery time < 30 seconds
   - Email formatting correct

## Monitoring

### Resend Dashboard

Check regularly:
- **Logs**: See all sent emails
- **Analytics**: Delivery rates
- **Bounces**: Failed deliveries
- **Complaints**: Spam reports

### Email Best Practices

1. **Use verified domain**
2. **Add SPF/DKIM records** (Resend provides these)
3. **Monitor bounce rates**
4. **Don't send too frequently**
5. **Provide unsubscribe option** (for marketing emails)

## Common Issues

### Issue: Domain not verifying
**Solution:**
- Wait 1 hour for DNS propagation
- Check DNS records are correct
- Use DNS checker: [whatsmydns.net](https://www.whatsmydns.net)

### Issue: Emails going to spam
**Solution:**
- Verify domain properly
- Add all DNS records (SPF, DKIM, DMARC)
- Warm up domain (send gradually increasing volume)
- Ask users to whitelist your domain

### Issue: Still can't send to other emails
**Solution:**
- Verify domain shows "Verified" in Resend
- Update `from` address to use verified domain
- Redeploy application
- Clear cache

## Cost Breakdown

### Free Option (Current)
- Cost: $0
- Limitation: Only send to your email
- Good for: Development/testing

### Domain + Free Resend
- Domain: ~$10-15/year
- Resend: $0
- Emails: 100/day, 3,000/month
- Good for: Small projects, MVP

### Domain + Resend Pro
- Domain: ~$10-15/year
- Resend: $20/month
- Emails: 50,000/month
- Good for: Production apps

## Quick Start Guide

### For Immediate Testing (5 minutes)
1. Register with `gauravsapkal1997@gmail.com`
2. Check email for OTP
3. Complete verification
4. Test all features

### For Production (1-2 hours)
1. Buy domain (~10 min)
2. Add to Resend (~5 min)
3. Configure DNS (~10 min)
4. Wait for verification (~30-60 min)
5. Update code (~5 min)
6. Deploy (~5 min)
7. Test (~10 min)

## Support

- **Resend Docs**: https://resend.com/docs
- **Resend Support**: support@resend.com
- **DNS Help**: Your domain registrar's support

---

**Current Status**: ✅ Working for `gauravsapkal1997@gmail.com`
**For Production**: ⚠️ Domain verification required
**Recommended**: Verify domain before public launch
