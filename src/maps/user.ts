export interface PublicUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export type UserLike = {
  _id: string;
  username: string;
  email: string;
  role: string;
};

export const toPublicUser = (user: UserLike): PublicUser => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  role: user.role,
});
