# OTP Verification Fix - Account Creation Only After Verification

## Problem
Accounts were being created immediately upon registration, even without OTP verification. Users could potentially access the system without verifying their email.

## Solution
Implemented a two-phase account creation system using the `isPending` flag:

### Phase 1: Registration (Pending Account)
- User submits registration form
- OTP email is sent to `gauravsapkal1997@gmail.com` (with original requester shown in body)
- User account is created with:
  - `isPending: true`
  - `verified: false`
  - OTP and expiry stored

### Phase 2: OTP Verification (Account Activation)
- User enters OTP from email
- System validates OTP and expiry
- Account is activated by setting:
  - `isPending: false`
  - `verified: true`
  - Default stages are created
  - User can now login

## Changes Made

### 1. User Model (`models/User.js`)
- Already had `isPending` field added

### 2. Registration Route (`app/api/auth/register/route.js`)
- Creates user with `isPending: true`
- Allows re-registration for pending accounts (deletes old pending account)
- Prevents registration if verified account already exists

### 3. OTP Verification Route (`app/api/auth/verify-otp/route.js`)
- Sets `isPending: false` when OTP is verified
- Sets `verified: true`
- Creates default stages only after verification

### 4. Login Route (`app/api/auth/login/route.js`)
- Checks for `isPending: true` and rejects login
- Shows clear message: "Please verify your email first. Check your inbox for the OTP."

## Flow Diagram

```
Registration
    ↓
Send OTP Email (to gauravsapkal1997@gmail.com)
    ↓
Create User (isPending: true, verified: false)
    ↓
User Enters OTP
    ↓
Verify OTP
    ↓
Activate Account (isPending: false, verified: true)
    ↓
Create Default Stages
    ↓
User Can Login
```

## Testing

1. Register with new email
2. Check that OTP is sent to `gauravsapkal1997@gmail.com`
3. Try to login before verification → Should fail with "Please verify your email first"
4. Enter OTP to verify
5. Login should now work

## Benefits

- Ensures email verification before account access
- Prevents spam registrations
- Allows users to re-request OTP if needed
- Clear error messages guide users through the process
