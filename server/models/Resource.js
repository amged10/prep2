const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  href: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedByName: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
