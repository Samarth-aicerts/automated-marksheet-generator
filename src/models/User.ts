import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  googleId: string;
  accessToken: string;
  refreshToken: string;   
}

const userSchema = new Schema<IUser>({
  email: { 
    type: String,
    required: true,
    unique: true,
  },
  googleId: {
    type: String,
    required: true,
  },    
  accessToken: {
    type: String,
    required: true,
  },                          
  refreshToken: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,   
}
);

const User = model<IUser>("User", userSchema);

export default User;