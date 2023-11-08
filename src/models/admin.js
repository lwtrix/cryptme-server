import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt'

const adminSchema = new Schema({
  username: {
    type: String,
    minLength: 3,
    maxLength: 12,
    required: [true, 'Username is required'],
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email is required']
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
    maxLength: 18
  }
});

adminSchema.pre('save', async function (next) {
  if(!this.isModified('password')) next()

  const hashedPw = await bcrypt.hash(this.password, 11)
  this.password = hashedPw

  next()
})

export const Admin = model('Admin', adminSchema)
