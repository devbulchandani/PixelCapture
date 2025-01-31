'use server'

import { actionClient } from '@/lib/safe-action'
import {
    UploadApiResponse, v2 as cloudinary
} from 'cloudinary'
import { resolve } from 'path'
import z from 'zod'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

type UploadResult =
    | { success: UploadApiResponse; error?: never }
    | { error: string; success?: never }

const formData = z.object({
    image: z.instanceof(FormData),
})

export const uploadImage = actionClient
    .schema(formData)
    .action(async ({ parsedInput: { image } }): Promise<UploadResult> => {
        const formImage = image.get('image');

        if (!formImage) {
            return {
                error: 'No image was provided',
            }
        }

        if (!image) {
            return {
                error: 'No image provided',
            }
        }

        const file = formImage as File;


        try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            return new Promise<UploadResult>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                }, (error, result) => {
                    if (error || !result) {
                        reject({ error: 'Upload failed' });
                    } else {
                        resolve({ success: result });
                    }
                })
                uploadStream.end(buffer);
            })
        } catch (error) {
            console.error("Error processing file:", error)
            return { error: "Error processing file" }
        }
    })