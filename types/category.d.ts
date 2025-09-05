export interface ICategory extends Document {
  name: string;
  icon: string;
  description: string
  order: number;
}
