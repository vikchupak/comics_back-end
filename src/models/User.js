const { Schema, model } = require('mongoose');
// const bcrypt = require('bcryptjs');

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    // select: false,
  },
  displayName: String,
});

// userData: { type: Schema.Types.ObjectId, ref: 'UserData' },
// // fire a function before doc saved to db
// userSchema.pre('save', async function (next) {
//   const salt = await bcrypt.genSalt();
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // static method to login user
// userSchema.statics.login = async function (email, password) {
//   const user = await this.findOne({ email });
//   if (user) {
//     const auth = await bcrypt.compare(password, user.password);
//     if (auth) {
//       return user;
//     }
//     throw Error('incorrect password');
//   }
//   throw Error('incorrect email');
// };

const User = model('User', userSchema);

module.exports = User;
