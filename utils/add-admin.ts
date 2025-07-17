import UserSchema from "../models/user-model";

const addAdmin = async () => {
  const isAdminExist = await UserSchema.findOne({ role: "ADMIN" });

  if (isAdminExist) {
    return console.info("[i] admin already exists");
  }

  await UserSchema.create({
    firstname: process.env.NEXT_PUBLIC_ADMIN_FIRSTNAME,
    lastname: process.env.NEXT_PUBLIC_ADMIN_LASTNAME,
    username: process.env.NEXT_PUBLIC_ADMIN_USERNAME,
    password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
    phoneNumber: process.env.NEXT_PUBLIC_ADMIN_PHONE_NUMBER,
    address: process.env.NEXT_PUBLIC_ADMIN_ADDRESS,
    role: "ADMIN",
  });

  return console.log("[+] admin added");
};

export default addAdmin;
