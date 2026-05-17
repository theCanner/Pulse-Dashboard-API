import express from 'express';
import { deleteUserById, getUser, getUserById } from '../db/users';
import { apiResponse } from '../utils/apiResponse';

export const getAllusers = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const users = await getUser();
    return apiResponse({
      res,
      statusCode: 200,
      message: 'Retrieved all users',
      data: users,
    });
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUserById(id as string);
    return res.status(200).json(deletedUser);
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response,
) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const user = await getUserById(id as string);
    if (!user) {
      return apiResponse({
        res,
        statusCode: 403,
        message: 'User not found',
      });
    }

    user.username = username;
    await user.save();

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return apiResponse({
      res,
      statusCode: 400,
      message: 'Invalid Request',
    });
  }
};
