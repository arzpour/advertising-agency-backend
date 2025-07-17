import UserSchema from "../models/user";

const addAdmin = async () => {
  const isAdminExist = await UserSchema.findOne({ role: "ADMIN" });

  if (isAdminExist) {
    return console.info("[i] admin already exists");
  }

  await UserSchema.create({
    firstname: process.env.ADMIN_FIRSTNAME,
    lastname: process.env.ADMIN_LASTNAME,
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
    phoneNumber: process.env.ADMIN_PHONE_NUMBER,
    address: process.env.ADMIN_ADDRESS,
    role: "ADMIN",
  });

  return console.log("[+] admin added");
};

export default addAdmin;
