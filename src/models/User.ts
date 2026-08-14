import mongoose, { type Document, type Model, Schema } from "mongoose";

import { UserRole } from "@/constants/roles";
import { UserStatus } from "@/constants/user-status";
import { hashPassword, normalizeEmail, verifyPassword } from "@/lib/auth/password";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(password: string): Promise<boolean>;
}

export interface CreateInvestorInput {
  name: string;
  email: string;
  password: string;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export interface IUserModel extends Model<IUserDocument> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByEmailWithPassword(email: string): Promise<IUserDocument | null>;
  createInvestor(input: CreateInvestorInput): Promise<IUserDocument>;
  createAdmin(input: CreateAdminInput): Promise<IUserDocument>;
  verifyCredentials(
    email: string,
    password: string,
  ): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [1, "Name is required"],
      maxlength: [100, "Name must be 100 characters or fewer"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [255, "Email must be 255 characters or fewer"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: "Invalid role",
      },
      required: true,
    },
    status: {
      type: String,
      enum: {
        values: Object.values(UserStatus),
        message: "Invalid status",
      },
      required: true,
      default: UserStatus.ACTIVE,
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", function normalizeEmailBeforeSave(next) {
  if (this.isModified("email")) {
    this.email = normalizeEmail(this.email);
  }
  next();
});

userSchema.methods.comparePassword = async function comparePassword(
  password: string,
): Promise<boolean> {
  return verifyPassword(password, this.passwordHash);
};

userSchema.statics.findByEmail = function findByEmail(email: string) {
  return this.findOne({ email: normalizeEmail(email) });
};

userSchema.statics.findByEmailWithPassword = function findByEmailWithPassword(
  email: string,
) {
  return this.findOne({ email: normalizeEmail(email) }).select("+passwordHash");
};

userSchema.statics.createInvestor = async function createInvestor(
  input: CreateInvestorInput,
) {
  const passwordHash = await hashPassword(input.password);
  return this.create({
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    passwordHash,
    role: UserRole.INVESTOR,
    status: UserStatus.ACTIVE,
  });
};

userSchema.statics.createAdmin = async function createAdmin(
  input: CreateAdminInput,
) {
  const passwordHash = await hashPassword(input.password);
  return this.create({
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    passwordHash,
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });
};

userSchema.statics.verifyCredentials = async function verifyCredentials(
  email: string,
  password: string,
) {
  const user = await this.findByEmailWithPassword(email);
  if (!user) {
    return null;
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return null;
  }

  return user;
};

export const User =
  (mongoose.models.User as IUserModel | undefined) ??
  mongoose.model<IUserDocument, IUserModel>("User", userSchema);
