interface IProject extends Document {
  title: string;
  description: string;
  category: string;
  url: string;
  thumbnail: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
