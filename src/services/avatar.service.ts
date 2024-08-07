import IAvatar from "../interfaces/avatar.interface";
import Avatar from "../models/avatar.model";
import { File } from "tsoa";

export default class AvatarService {
    /**
     * Retrieves an avatar for the specified accountId from the database.
     * @param accountId The unique identifier of the account to which the avatar belongs.
     * @returns The avatar object if found, otherwise null.
     */
    async getAvatar(accountId: string): Promise<IAvatar | null> {
        const avatar = await Avatar.findOne({ accountId });
        if (avatar) return avatar.toJSON();

        return null;
    }

    /**
     * Creates a new avatar for the specified accountId and saves it to the database.
     * @param accountId The unique identifier of the account to which the avatar belongs.
     * @param file The file containing the image data for the new avatar.
     * @returns The newly created avatar object.
     */
    async createAvatar(accountId: string, file: File): Promise<IAvatar> {
        const existingAvatar = await Avatar.findOne({ accountId });
        if (existingAvatar) throw new Error('Avatar already exists');
        const avatar = new Avatar();
        avatar.accountId = accountId;
        avatar.imageUrl = `https://example.com/image-${file.filename}`;
        avatar.thumbnailUrl = this.generateThumbnail(file);
        return (await avatar.save()).toJSON();
    }

    /**
     * Updates an existing avatar for the specified accountId and saves it to the database.
     * @param accountId The unique identifier of the account to which the avatar belongs.
     * @param file The file containing the new image data for the existing avatar.
     * @returns The updated avatar object if found, otherwise null.
     */
    async updateAvatar(accountId: string, file: File): Promise<IAvatar | null> {
        const avatar = await Avatar.findOne({ accountId });
        if (!avatar) return null;
        avatar.imageUrl = `https://example.com/image-${file.originalname}`;
        avatar.thumbnailUrl = this.generateThumbnail(file);
        avatar.updatedAt = new Date();
        return (await avatar.save()).toJSON();
    }

    /**
     * Deletes the avatar for the specified accountId from the database.
     * @param accountId The unique identifier of the account to which the avatar belongs.
     * @returns A Promise that resolves when the avatar is successfully deleted.
     */
    async deleteAvatar(accountId: string): Promise<void> {
        await Avatar.deleteOne({ accountId });
    }

    /**
     * Generates a thumbnail URL for the given file.
     * @param file The file containing the image data for the new avatar.
     * @returns A URL representing the thumbnail image.
     */
    generateThumbnail(file: File): string {
        return `https://example.com/thumbnail-${file.originalname}`;
    }
}