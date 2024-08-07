import { Schema } from "mongoose";
import IAvatar from "../interfaces/avatar.interface";

const avatarSchema: Schema = new Schema<IAvatar>({
    accountId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

avatarSchema.set('toJSON', {
    virtuals: true,
    transform: (_, ret) => {
        delete ret.id;
        delete ret.__v;
        delete ret._id;
    },
});

export default avatarSchema;