const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true }, // store display name for fast access
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
