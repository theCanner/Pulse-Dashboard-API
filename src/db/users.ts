import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'user'],
    required: true,
  },
  authentication: {
    password: { type: String, required: true, select: false },
  },
  refreshToken: { type: String, select: false },
});

type UserJSON = {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
};

userSchema.set('toJSON', {
  transform: (doc, ret): UserJSON => {
    return {
      id: ret._id.toString(),
      username: ret.username,
      email: ret.email,
      role: ret.role,
    };
  },
});

export const userModel = mongoose.model('User', userSchema);

export const getUser = () => userModel.find();
export const getUserByEmail = (email: string) => userModel.findOne({ email });
export const getUserById = (id: string) => userModel.findById(id);
export const createUser = (values: Record<string, unknown>) =>
  new userModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id: string) => userModel.findByIdAndDelete(id);
export const updateUserById = (id: string, values: Record<string, unknown>) =>
  userModel.findByIdAndUpdate(id, values);
