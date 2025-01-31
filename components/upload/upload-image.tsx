'use client'

import { uploadImage } from "@/server/upload-image";
import { useDropzone } from "react-dropzone"
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { useImageStore } from "@/lib/image-store";
import { useLayerStore } from "@/lib/layer-store";

export default function UploadImage() {

    const setGenerating = useImageStore((state) => state.setGenerating);
    const activeLayer = useLayerStore((state) => state.activeLayer);
    const updateLayer = useLayerStore((state) => state.updateLayer);
    const setActiveLayer = useLayerStore((state) => state.setActiveLayer);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        maxFiles: 1,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpeg'],
            'image/jpg': ['.jpg'],
            'image/webp': ['.webp'],
        },

        onDrop: async (acceptedFiles, filesRejections) => {
            if (acceptedFiles.length) {
                console.log('dropping');
                const formData = new FormData();
                formData.append('image', acceptedFiles[0]);
                const objectUrl = URL.createObjectURL(acceptedFiles[0]);
                setGenerating(true);
                updateLayer({
                    id: activeLayer.id,
                    url: objectUrl,
                    height: 0,
                    width: 0,
                    publicId: "",
                    name: "uploading",
                    format: "",
                    resourceType: "image"
                })

                setActiveLayer(activeLayer.id);
                //State Management Stuff to create layers, set active layers, set the image as the active layer
                const res = await uploadImage({ image: formData });
                if (res?.data?.success) {
                    updateLayer({
                        id: activeLayer.id,
                        url: res.data.success.url,
                        width: res.data.success.width,
                        height: res.data.success.height,
                        name: res.data.success.original_filename,
                        publicId: res.data.success.public_id,
                        format: res.data.success.format,
                        resourceType: res.data.success.resource_type,
                    })
                    setActiveLayer(activeLayer.id);
                    setGenerating(false);
                }
                if (res?.data?.error) {
                    setGenerating(false);

                }
            }
        },
    });

    if (!activeLayer.url)
    return (
        <Card
            {...getRootProps()}
            className={cn(
                " hover:cursor-pointer hover:bg-secondary hover:border-primary transition-all  ease-in-out",
                `${isDragActive ? "animate-pulse border-primary bg-secondary" : ""}`
            )
            } >
            <CardContent className="flex flex-col h-full items-center justify-center px-2 py-24  text-xs ">
                <input {...getInputProps()} />
                <div className="flex items-center flex-col justify-center gap-4">
                    <p className="text-muted-foreground text-2xl">
                        {isDragActive
                            ? "Drop your image here!"
                            : "Start by upload your image"}
                    </p>
                    <p className="text-muted-foreground">Supported Formats: .jped, .png, .jpg, .webp</p>
                </div>
            </CardContent>
        </Card>
    )
}