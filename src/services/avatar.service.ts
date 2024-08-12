import IAvatar from "../interfaces/avatar.interface";
import Avatar from "../models/avatar.model";
import { File } from "tsoa";
import { uploadFileToS3 } from "../providers/s3.provider";
import sharp from "sharp";
import dayjs from "dayjs";

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
        
        return this.saveAvatar(accountId, file, new Avatar());
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
        return this.saveAvatar(accountId, file, avatar);
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
     * @param pixelSize The desired size of the thumbnail (default: 64).
     * @returns A Buffer of the thumbnail image.
     */
    async generateThumbnail(file: File, pixelSize: number = 128, borderColor: "#D90040", borderWidthPixels: number = 4): Promise<Buffer> {
        const innerSize = pixelSize - 2 * borderWidthPixels;
        const circleMask = Buffer.from(`<svg width="${innerSize}" height="${innerSize}"><circle cx="${innerSize / 2}" cy="${innerSize / 2}" r="${innerSize / 2}" /></svg>`);
        const ringMask = Buffer.from(
            `<svg width="${pixelSize}" height="${pixelSize}">
                <circle cx="${pixelSize / 2}" cy="${pixelSize / 2}" r="${innerSize / 2}" fill="none" stroke="${borderColor}" stroke-width="${borderWidthPixels}" />
            </svg>`
        );
        const avatarImageBuffer: Buffer = await sharp(file.buffer)
        .resize(innerSize, innerSize)
        .composite([{ input: circleMask, blend: 'dest-in' }])
        .png()
        .toBuffer();

        return await sharp({
            create: {
                width: pixelSize,
                height: pixelSize,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            }
        })
        .composite([{ input: avatarImageBuffer, top: borderWidthPixels, left: borderWidthPixels }, { input: ringMask, blend: 'over' }])
        .png()
        .toBuffer();
    }

    /**
     * Helper function to save an avatar (create or update).
     * @param accountId The unique identifier of the account to which the avatar belongs.
     * @param file The file containing the image data for the avatar.
     * @param avatar The avatar instance to be saved.
     * @returns The saved avatar object.
     */
    private async saveAvatar(accountId: string, file: File, avatar: InstanceType<typeof Avatar>): Promise<IAvatar> {
        const thumbnail: Buffer = await this.generateThumbnail(file);
        const locations = await this.uploadAvatarToS3(accountId, file, thumbnail);
        avatar.accountId = accountId;
        avatar.imageUrl = locations.location;
        avatar.thumbnailUrl = locations.thumbnailLocation;
        avatar.updatedAt = new Date();
        return (await avatar.save()).toJSON();
    }

    /**
     * Helper function to get file extension.
     * @param filename The file name to parse.
     * @returns The file extension or empty string.
     */
    private getFileExtension(filename: string): string {
        return filename.split('.').pop() || '';
    }

    /**
     * Helper function to generate thumbnail file name.
     * @param accountId The unique identifier of the account to which the avatar belongs.
     * @param date The date for which the thumbnail file name should be generated.
     * @returns The thumbnail file name.
     */
    private generateThubmnailFileName(accountId: string, date: Date = new Date()): string {
        const dateString = dayjs(date).format('YYYY.MM.DD.HH.mm.ss');
        return `${dateString}__${accountId}.png`;
    }

    /**
     * Helper function to upload avatar and thumbnail to S3.
     * @param accountId The unique identifier of the account to which the avatar belongs.
     * @param file The file containing the image data for the avatar.
     * @param thumbnail The thumbnail image data.
     */
    private async uploadAvatarToS3(accountId: string, file: File, thumbnail: Buffer): Promise<{ location: string; thumbnailLocation: string; }> {
        const avatarBucket = process.env.AWS_MEDIA_BUCKET || '';
        const avatarKey = process.env.AWS_AVATAR_KEY || '';
        const fileExtension = this.getFileExtension(file.originalname);
        const thumnailName = this.generateThubmnailFileName(accountId);
        const location = await uploadFileToS3(avatarBucket, file.buffer, `${avatarKey}/${accountId}.${fileExtension}`) as string;
        const thumbnailLocation = await uploadFileToS3(avatarBucket, thumbnail, `${avatarKey}/${thumnailName}`) as string;
        return { location, thumbnailLocation };
    }
}