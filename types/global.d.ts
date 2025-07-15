interface IQueryString {
  page?: string;
  limit?: string;
  sort?: string;
  fields?: string;
  [key: string]: string | string[] | undefined;
}

interface IUploadFiles {
  thumbnail?: Express.Multer.File[];
  images?: Express.Multer.File[];
}
