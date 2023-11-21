import { Schema, model } from 'mongoose';

const articleSchema = new Schema({
  title: {
    type: String,
    minLength: 3,
    maxLength: 36,
    required: [true, 'A title is required to create a new article'],
  },
  paragraphs: {
    type: [
      {
        type: String,
        minLength: 28,
        maxLength: 720,
      },
    ],
    validate: {
      validator: function (paragraphs) {
        return paragraphs.length >= 1;
      },
      message: 'At least one paragraph is required to create an article',
    },
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },
  publishedAt: {
    type: Date,
    default: Date.now(),
  },
});

export const Article = model('Article', articleSchema);
