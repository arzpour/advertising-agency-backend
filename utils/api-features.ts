import { Query } from "mongoose";
import { IQueryString } from "../types/global";

class ApiFeatures<T> {
  private model: Query<T[], T>;
  private queryString: IQueryString;

  constructor(model: Query<T[], T>, queryString: IQueryString) {
    this.model = model;
    this.queryString = queryString;
  }

  limitFields() {
    const { fields = "-__v" } = this.queryString;

    const selectedFields = typeof fields === "string" ? fields.split(",") : [];

    this.model = this.model.select(selectedFields.join(" "));
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;

    this.model = this.model.skip(skip).limit(limit);
    return this;
  }

  filter() {
    const { page, limit, sort, fields, ...filter } = this.queryString;

    const filterObject: Record<string, unknown> = {};

    for (const key in filter) {
      const value = filter[key];
      if (value === "string") {
        if (key.includes("[")) {
          const [field, operator] = key.split("[");
          const cleanOperator = operator.replace("]", "");

          filterObject[field] = { [`$${cleanOperator}`]: value };
        } else {
          filterObject[key] = value;
        }
      }
    }

    this.model = this.model.find(filterObject);
    return this;
  }

  sort() {
    const sortBy =
      typeof this.queryString.sort === "string"
        ? this.queryString.sort
        : "createdAt";

    this.model = this.model.sort(sortBy);
    return this;
  }

  getQuery() {
    return this.model;
  }
}

export { ApiFeatures };
