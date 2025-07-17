import { model, Schema } from "mongoose";
import bcrypt from "bcrypt";

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "firstname is required"],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "lastname is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: [8, "password must have more or equal then 8 characters"],
      select: false,
      validate: {
        validator: (password: string) => passwordRegex.test(password),
        message: "password must have at least one letter and one digit",
      },
    },
    phoneNumber: {
      type: String,
      unique: true,
      required: [true, "phoneNumber is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "address is required"],
      trim: true,
    },
    role: {
      type: String,
      default: "USER",
      enum: {
        values: ["ADMIN", "USER"],
        message: "invalid role: ({VALUE})",
      },
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// hash user password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

// compare hash and plain password
userSchema.methods.comparePassword = async function (userPassword: string) {
  return await bcrypt.compare(userPassword, this.password);
};

const UserSchema = model<IUser>("user", userSchema);

export default UserSchema;
