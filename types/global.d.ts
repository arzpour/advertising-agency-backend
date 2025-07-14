interface IQueryString {
  [key: string]: string | string[] | undefined;
}

interface IUploadFiles {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
}
