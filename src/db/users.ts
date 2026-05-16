import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : { type:String, required :true },
    email: { type:String, required :true },
    role: {
            type: String,
            enum: ["admin", "user"],
            required: true,
    },
    authentication : {
        password : { type:String , required:true, select:false }
    },
    refreshToken: { type: String, select: false }
})

userSchema.set("toJSON", {
  transform: (doc, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v; 
    delete ret.authentication;
    delete ret.refreshToken;   
    return ret;
  },
});

export const userModel = mongoose.model('User',userSchema);

export const getUser = () => userModel.find();
export const getUserByEmail = (email:string) => userModel.findOne({email})
// export const getUserBySessionToken = (sessionToken:string) => userModel.findOne({
//     'authentication.sessionToken' : sessionToken
// }) 
export const getUserById = (id:string) => userModel.findById(id);
export const createUser = (values: Record<string,any>) => new userModel(values).save().then((user)=> user.toObject())
export const deleteUserById = (id:string) => userModel.findByIdAndDelete(id);
export const updateUserById = (id:string, values: Record<string,any>) => userModel.findByIdAndUpdate(id,values)