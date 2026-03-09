// Sample data seeder for testing
// Run with: node scripts/seed.js

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job-tracker';

const sampleJobs = [
  {
    company: 'Google',
    role: 'Senior Software Engineer',
    location: 'Mountain View, CA',
    salaryExpectation: '$180k - $220k',
    jobLink: 'https://careers.google.com',
    contactName: 'Jane Smith',
    contactEmail: 'jane@google.com',
    notes: 'Referred by John. Focus on distributed systems experience.',
  },
  {
    company: 'Meta',
    role: 'Frontend Engineer',
    location: 'Menlo Park, CA',
    salaryExpectation: '$160k - $200k',
    jobLink: 'https://careers.meta.com',
    contactName: 'Mike Johnson',
    contactEmail: 'mike@meta.com',
    notes: 'React and GraphQL focus. Team works on Instagram.',
  },
  {
    company: 'Amazon',
    role: 'Full Stack Developer',
    location: 'Seattle, WA',
    salaryExpectation: '$150k - $190k',
    jobLink: 'https://amazon.jobs',
    notes: 'AWS team. Need to prepare for leadership principles.',
  },
  {
    company: 'Microsoft',
    role: 'Cloud Solutions Architect',
    location: 'Redmond, WA',
    salaryExpectation: '$170k - $210k',
    jobLink: 'https://careers.microsoft.com',
    contactName: 'Sarah Williams',
    contactEmail: 'sarah@microsoft.com',
    notes: 'Azure focus. Hybrid role.',
  },
  {
    company: 'Stripe',
    role: 'Backend Engineer',
    location: 'San Francisco, CA',
    salaryExpectation: '$165k - $205k',
    jobLink: 'https://stripe.com/jobs',
    notes: 'Payments infrastructure team. Strong focus on reliability.',
  },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    console.log('\n⚠️  This is a sample seeder script.');
    console.log('To use it, you need to:');
    console.log('1. Have a user account created');
    console.log('2. Get the user ID from MongoDB');
    console.log('3. Update this script with the user ID');
    console.log('4. Run: node scripts/seed.js\n');

    console.log('Sample jobs that would be created:');
    sampleJobs.forEach((job, i) => {
      console.log(`${i + 1}. ${job.company} - ${job.role}`);
    });

    console.log('\nTo implement seeding:');
    console.log('1. Import User, Job, and Stage models');
    console.log('2. Find a user: const user = await User.findOne({ email: "your@email.com" })');
    console.log('3. Get first stage: const stage = await Stage.findOne({ userId: user._id })');
    console.log('4. Create jobs with userId and stageId');

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
