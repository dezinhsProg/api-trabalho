const express = require('express');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();


const router = express.Router();

router.post('/user/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  return res.json(user);
});

router.post('/user/create', async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
  });

  return res.json(user);
});

router.get('/user/all', async (req, res) => {
  const users = await User.findAll();

  return res.json(users);
});

router.get('/user/show/:id', async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(user);
});

router.post('/user/recovery', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    text: `Hello ${user.name}, you have requested to reset your password.
     Please click on the following link to reset your password: ${process.env.BASE_URL}/user/reset/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

  return res.json({ message: 'An email has been sent to reset your password.' });
});

module.exports = router;
