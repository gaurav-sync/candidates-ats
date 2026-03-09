import mongoose from 'mongoose';

const StageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#6366f1',
  },
});

export default mongoose.models.Stage || mongoose.model('Stage', StageSchema);
