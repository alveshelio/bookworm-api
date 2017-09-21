import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// TODO: add uniqueness and email validations to email field
const schema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true,
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  confirmationToken: {
    type: String,
    default: ''
  },
  resetPasswordToken: {
    type: String,
    default: ''
  }
}, { timestamps: true });

schema.methods.isValidPassword = function isValidPassword(password) {
  return bcrypt.compareSync(password, this.passwordHash);
};

schema.methods.setPassword = function setPassword(password) {
  this.passwordHash = bcrypt.hashSync(password, 10);
};

schema.methods.setResetPasswordToken = function setResetPasswordToken() {
  this.resetPasswordToken = ''
};

schema.methods.setConfirmationToken = function setConfirmationToken() {
  this.confirmationToken = this.generateJWT();
};

schema.methods.generateConfirmationUrl = function generateConfirmationUrl() {
  return `${process.env.HOST}/confirmation/${this.confirmationToken}`;
};

schema.methods.generateResetPasswordLink = function generateResetPasswordLink() {
  this.resetPasswordToken = this.generateResetPasswordToken();
  this.save();
  return `${process.env.HOST}/reset_password/${this.resetPasswordToken}`;
};

schema.methods.generateJWT = function generateJWT() {
  return jwt.sign({
    email: this.email,
    confirmed: this.confirmed
  }, process.env.JTW_SECRET);
};

schema.methods.generateResetPasswordToken = function generateResetPasswordToken() {
  return jwt.sign({ _id: this._id, },
    process.env.JTW_SECRET,
    { expiresIn: '1 hour' });
};

schema.methods.toAuthJSON = function toAuthJSON() {
  return {
    email: this.email,
    confirmed: this.confirmed,
    token: this.generateJWT()
  };
};

schema.plugin(uniqueValidator, { message: 'This email is already taken' });

export default mongoose.model('User', schema);