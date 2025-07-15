interface IBlog extends Document {
  title: string;
  description: string;
  thumbnail: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
