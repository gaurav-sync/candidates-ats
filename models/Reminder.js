import mongoose from 'mongoose';

const ReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  dateTime: {
    type: Date,
    required: true,
  },
  emailSent: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Reminder || mongoose.model('Reminder', ReminderSchema);
