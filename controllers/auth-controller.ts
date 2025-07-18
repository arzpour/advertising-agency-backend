import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { AppError } from "../utils/app-error";
import asyncHandler from "../utils/async-handler";
import jwt from "jsonwebtoken";

const verifyAsync = (token: string, secret: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};

const signToken = async (id: string) => {
  if (
    !process.env.JWT_ACCESS_TOKEN_SECRET ||
    !process.env.JWT_REFRESH_TOKEN_SECRET
  ) {
    throw new Error(
      "JWT secrets are not defined in the environment variables."
    );
  }

  const accessToken = jwt.sign({ id }, process.env.JWT_ACCESS_TOKEN_SECRET!, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? "1h",
  });

  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? "7d",
  });

  return { accessToken, refreshToken };
};

const generateAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.body;
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    }
  );

  res.status(200).json({
    status: "success",
    token: { accessToken },
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
  const { password, username } = req.body;

  const isPhone = /^\d{10,}$/.test(username);

  const user = await User.findOne({
    [isPhone ? "phoneNumber" : "username"]: username,
  }).select("+password");

  if (!user) {
    return next(new AppError(401, "incorrect username or password"));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new AppError(401, "incorrect username or password2"));
  }

  const { accessToken, refreshToken } = await signToken(user.id);

  

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });



  res.status(200).json({
    status: "success",
    token: { accessToken, refreshToken },
    data: { user },
  });
};

const logout = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
};

const signup = async (req: Request, res: Response, next: NextFunction) => {
  const { firstname, lastname, username, password, phoneNumber, address } =
    req.body;

  const userExists = await User.exists({ username });
  if (userExists) {
    return next(
      new AppError(
        409,
        "username is already taken. choose a different username"
      )
    );
  }

  const phoneNumberExists = await User.exists({ phoneNumber });
  if (phoneNumberExists) {
    return next(new AppError(409, "phoneNumber is already exists."));
  }

  const user = await User.create({
    firstname,
    lastname,
    username,
    password,
    phoneNumber,
    address,
    role: "USER",
  });

  const { accessToken, refreshToken } = await signToken(user.id);

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  res.status(201).json({
    status: "success",
    token: { accessToken, refreshToken },
    data: { user },
  });
};

const protect = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { authorization = null } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer")) {
      return next(
        new AppError(401, "You are not logged in! Please log in to get access")
      );
    }

    const token = authorization.split(" ")[1];

    // const decoded = await promisify(jwt.verify)(
    //   token,
    //   process.env.JWT_ACCESS_TOKEN_SECRET
    // );

    const decoded = await verifyAsync(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET!
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(
        new AppError(
          401,
          "The user belonging to this token does no longer exist"
        )
      );
    }

    // req.userId = user._id;
    req.body.userId = user._id.toString();

    next();
  }
);

const restrictTo = (...roles: string[]) => {
  return asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId = null } = req.body;
      const user = await User.findById(userId);

      if (!user || !roles.includes(user.role)) {
        return next(
          new AppError(403, "You do not have permission to perform this action")
        );
      }

      next();
    }
  );
};

const authenticateRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { refreshToken = null } = req.body;

  if (!refreshToken) {
    return next(new AppError(401, "refresh token missing"));
  }

  const decoded = await verifyAsync(
    refreshToken,
    process.env.JWT_REFRESH_TOKEN_SECRET!
  );
  const userId = decoded.id;

  const user = await User.findOne({ _id: userId, refreshToken });

  if (!user) {
    return next(
      new AppError(
        404,
        "the user belonging to this refresh token does no longer exist"
      )
    );
  }

  req.body.userId = userId;

  next();
};

export {
  login,
  logout,
  signup,
  protect,
  restrictTo,
  generateAccessToken,
  authenticateRefreshToken,
};
