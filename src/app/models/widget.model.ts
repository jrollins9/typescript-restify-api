import { Schema, model } from 'mongoose';

const schema = new Schema({
  current: {
    type: Boolean,
    required: true,
  },
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  deletedAt: {
    type: Date,
    required: false,
  }
}, {
    timestamps: true,
});

/* Add methods and statics here */

const Widget = model('Widget', schema);
export { Widget };
