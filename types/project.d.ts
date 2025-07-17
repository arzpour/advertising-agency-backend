export interface IProject extends Document {
  name: string;
  description: string;
  category: ObjectId;
  thumbnail: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}
