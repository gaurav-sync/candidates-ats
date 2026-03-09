# Job Application Tracker

A production-quality web application to help job seekers track applications and manage the entire interview pipeline from a single dashboard.

## Features

### Core Features
- **User Authentication**: Email + Password with OTP verification via Resend API
- **Dashboard**: Overview of applications, pipeline stages, upcoming reminders, and statistics
- **Job Management**: Track company, role, contacts, salary expectations, notes, and more
- **Kanban Pipeline**: Drag-and-drop board to move jobs between stages
- **Custom Stages**: Create, edit, and reorder pipeline stages
- **Reminders System**: Set reminders with email notifications
- **Calendar View**: Visual calendar showing all interviews and reminders
- **Timeline Tracking**: Log calls, emails, interviews, and assignments
- **Search & Filter**: Find jobs by company, role, or stage

### Additional Features
- Success rate analytics
- Overdue reminder highlighting
- Job archiving
- Stage history tracking
- Contact management
- Interview preparation tracking

## Tech Stack

- **Frontend + Backend**: Next.js 15 (App Router)
- **Database**: MongoDB with Mongoose
- **Styling**: TailwindCSS
- **State Management**: Redux Toolkit
- **Email**: Resend API
- **Drag & Drop**: @dnd-kit
- **Authentication**: JWT with bcrypt
- **Language**: JavaScript

## Prerequisites

- Node.js 18+ and npm
- MongoDB (local or cloud)
- Resend API key (for email notifications)

## Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
Edit `.env.local` with your values:
```env
MONGODB_URI=mongodb://localhost:27017/job-tracker
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
RESEND_API_KEY=your-resend-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=your-cron-secret-for-reminder-worker
```

3. **Start MongoDB** (if running locally):
```bash
mongod
```

4. **Run the development server**:
```bash
npm run dev
```

5. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## Getting Started

1. **Register**: Create an account with your email
2. **Verify**: Check your email for the OTP code
3. **Login**: Sign in with your credentials
4. **Add Jobs**: Start tracking your applications
5. **Set Reminders**: Never miss a follow-up or interview

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── jobs/         # Job management endpoints
│   │   ├── stages/       # Stage management endpoints
│   │   └── reminders/    # Reminder endpoints
│   ├── dashboard/        # Dashboard page
│   ├── jobs/             # Jobs list and detail pages
│   ├── pipeline/         # Kanban board
│   ├── calendar/         # Calendar view
│   ├── reminders/        # Reminders page
│   ├── settings/         # Settings page
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   └── verify-otp/       # OTP verification page
├── components/           # Reusable components
├── lib/                  # Utilities (MongoDB, Resend)
├── models/               # Mongoose models
├── store/                # Redux store
└── utils/                # Helper functions
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/login` - Login user

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `PATCH /api/jobs/update-stage` - Update job stage

### Stages
- `GET /api/stages` - Get all stages
- `POST /api/stages` - Create new stage
- `PUT /api/stages/:id` - Update stage
- `DELETE /api/stages/:id` - Delete stage

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `DELETE /api/reminders/:id` - Delete reminder
- `PATCH /api/reminders/:id` - Update reminder
- `GET /api/reminders/check` - Check and send reminder emails (cron job)

## Reminder Worker

To enable automatic reminder emails, set up a cron job to call:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/reminders/check
```

Run this every 5 minutes for best results. In production, use services like:
- Vercel Cron Jobs
- GitHub Actions
- External cron services (cron-job.org)

## Default Stages

When a user registers, these default stages are created:
1. Applied
2. HR Screening
3. Technical Round
4. Assignment
5. Manager Round
6. Final Round
7. Offer
8. Rejected

Users can add custom stages in Settings.

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Protected API routes
- OTP email verification
- Secure session management

## Production Deployment

1. Set up MongoDB Atlas or your preferred MongoDB host
2. Get a Resend API key from [resend.com](https://resend.com)
3. Deploy to Vercel, Railway, or your preferred platform
4. Set environment variables in your hosting platform
5. Set up cron job for reminder worker

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Contributing

This is a production-ready application. Feel free to customize and extend it for your needs.

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
