import api from "./api";
import type {
  UploadedImageResponse
} from "../types/image";

export const imageService = {
  uploadImages(files: File[]): Promise<UploadedImageResponse[]> {
    const formData = new FormData()

    files.forEach((file) => {
      formData.append('files', file)
    })

    return api
      .post('/cloudinary/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => res.data)
  },
}