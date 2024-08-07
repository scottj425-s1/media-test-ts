import { Get, Post, Route, UploadedFile, Put, Delete, File, FormField, TsoaResponse, Res } from "tsoa";
import AvatarService from "../services/avatar.service";
import IAvatar from "../interfaces/avatar.interface";

@Route('avatar')
export class ImageController {
    protected avatarService = new AvatarService();
    /**
     * Retrieves the avatar for the specified account.
     *
     * @param {string} accountId - The unique identifier of the account to retrieve.
     * @param {TsoaResponse<404, { reason: string }>} notFoundResponse - The response to send if the avatar is not found.
     * @returns {Promise<IAvatar>} - A promise that resolves to the avatar object if found.
     */
    @Get('{accountId}')
    public async getAvatar(accountId: string, @Res() notFoundResponse: TsoaResponse<404, { reason: string }>): Promise<IAvatar> {
        const avatar = await this.avatarService.getAvatar(accountId);
        if (!avatar) return notFoundResponse(404, { reason: 'Avatar not found' });
        return avatar;
    }

    /**
     * Uploads a new avatar image for the specified account.
     *
     * @param {string} accountId - The unique identifier of the account to which the new avatar will be associated.
     * @param {File} file - The image file to be uploaded as the new avatar.
     * @returns {Promise<void>} - A promise that resolves when the upload is complete.
     */
    @Post()
    public async uploadAvatar(
        @FormField() accountId: string,
        @UploadedFile() file: File,
    ): Promise<IAvatar> {
        return await this.avatarService.createAvatar(accountId, file);
    }

    /**
     * Updates the avatar image for the specified account.
     *
     * @param {string} accountId - The unique identifier of the account to which the new avatar will be associated.
     * @param {File} file - The image file to be uploaded as the new avatar.
     * @returns {Promise<void>} - A promise that resolves when the update is complete.
     */
    @Put('{accountId}')
    public async updateAvatar(
        accountId: string,
        @UploadedFile() file: File,
    ): Promise<void> {
        console.log(accountId, file);
    }

    /**
     * Deletes the specified avatar by its unique identifier.
     *
     * @param {string} accountId - The unique identifier of the account whose image will be deleted.
     * @returns {Promise<void>} - A promise that resolves when the deletion is complete.
     */
    @Delete('{accountId}')
    public async deleteAvatar(accountId: string): Promise<void> {
        this.avatarService.deleteAvatar(accountId);
    }
}