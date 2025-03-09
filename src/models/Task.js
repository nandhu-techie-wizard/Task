const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskNumber: { type: String, unique: true }, // Unique Task Number
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Task creator
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // Assigned user
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  dueDate: { type: Date }, // NEW: Due Date field
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
