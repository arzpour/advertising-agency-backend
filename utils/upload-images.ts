import { join } from "path";
import multerUpload from "./multer-config";
import sharp from "sharp";

export const thumbnailsDefault = (title: string) =>
  `${title}-thumbnails-default.jpeg`;
export const imagesDefault = (title: string) => [
  `${title}-images-default.jpeg`,
];

export const uploadImages = multerUpload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "images", maxCount: 10 },
]);

export const resizeThumbnail = async (
  title: string,
  id: string,
  files: IUploadFiles
) => {
  const { thumbnail = [] } = files;

  if (!thumbnail.length) return null;

  const thumbnailFileName = `${title}-${id}-${Date.now()}.jpeg`;

  await sharp(thumbnail[0].buffer)
    .resize(1500, 800)
    .toFormat("jpeg")
    .toFile(
      join(
        __dirname,
        `../public/images/${title}/thumbnails/${thumbnailFileName}`
      )
    );

  return thumbnailFileName;
};

export const resizeImages = async (
  title: string,
  id: string,
  files: IUploadFiles
) => {
  const { images = [] } = files;

  if (!images.length) return [];

  const resizedImages = await Promise.all(
    images.map(async (image, index: number) => {
      const imageFileName = `${title}-${id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(image.buffer)
        .resize(2000, 1300)
        .toFormat("jpeg")
        .jpeg({ quality: 95 })
        .toFile(
          join(__dirname, `../public/images/${title}/images/${imageFileName}`)
        );

      return imageFileName;
    })
  );

  return resizedImages;
};
