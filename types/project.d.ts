export interface IProject extends Document {
  name: string;
  description: string;
  category: ObjectId;
  thumbnail: string;
  images: string[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
