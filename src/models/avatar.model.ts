import mongoose from "mongoose";
import IAvatar from "../interfaces/avatar.interface";
import avatarSchema from "../schemas/avatar.schema";

const Avatar = mongoose.model<IAvatar>('Avatar', avatarSchema);

export default Avatar;