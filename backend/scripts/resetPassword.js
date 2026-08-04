const connectDB = require('../config/db');
const User = require('../models/User');

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error('Usage: node resetPassword.js <email> <newPassword>');
  process.exit(1);
}

const run = async () => {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    console.error('User not found:', email);
    process.exit(2);
  }

  user.password = newPassword;
  await user.save();
  console.log(`Password reset for ${email}`);
  process.exit(0);
};

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
