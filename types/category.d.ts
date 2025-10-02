export interface ICategory extends Document {
  name: string;
  icon: string;
  type: "project" | "blog";
}
