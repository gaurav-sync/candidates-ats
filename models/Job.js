import mongoose from 'mongoose';

const TimelineUpdateSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'interview', 'assignment', 'note', 'stage_change'],
    required: true,
  },
  title: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const JobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  jobLink: String,
  contactName: String,
  contactEmail: String,
  contactPhone: String,
  notes: String,
  salaryExpectation: String,
  location: String,
  stageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stage',
    required: true,
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  timelineUpdates: [TimelineUpdateSchema],
  archived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);
