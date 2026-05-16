import express from 'express'
import { deleteUserById, getUser, getUserById } from '../db/users'

export const getAllusers = async (req:express.Request , res:express.Response) => {
    try {
      const users = await getUser();
      return res.status(200).json(users);
    } catch (error){
        console.error(error)
        res.sendStatus(400)
    }
}

export const deleteUser = async (req:express.Request, res:express.Response) => {
    try {
        const { id } = req.params;
        const deletedUser = await deleteUserById(id as string)
        return res.status(200).json(deletedUser);
    } catch (error){
        console.error(error,'this is the error');
        res.sendStatus(400);
    }
}

export const updateUser = async (req:express.Request, res:express.Response) => {
    try {
        const { id } = req.params;
        const { username } = req.body;
        const user = await getUserById(id as string);
        if (!user) {
            return res.sendStatus(400);
        }

        user.username = username;
        await user.save();
        
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
}