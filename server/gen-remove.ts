'use server'
import { checkImageProcessing } from '@/lib/check-processing'
import { actionClient } from '@/lib/safe-action'
import {
    v2 as cloudinary
} from 'cloudinary'
import { resolve } from 'path'

import z from 'zod'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

const genRemoveSchema = z.object({
    prompt: z.string(),
    activeImage: z.string(),
})

export const genRemove = actionClient.schema(genRemoveSchema).action(
    async ({ parsedInput: { prompt, activeImage } }) => {
        const parts = activeImage.split('/upload/');
        const removeUrl = `${parts[0]}/upload/e_gen_remove:${prompt}/${parts[1]}`;
        console.log(removeUrl);

        let isProcessed = false;
        let maxAttempts = 20;
        const delay = 500;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            isProcessed = await checkImageProcessing(removeUrl);
            if (isProcessed) {
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, delay))
        }
        if (!isProcessed) {
            throw new Error("Image Processing timed out");
        }
        return { succes: removeUrl  }
    }
)

