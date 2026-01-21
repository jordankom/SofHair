import { Schema, model, Document } from "mongoose";

export interface IStaff extends Document {
    firstName: string;
    lastName: string;
    email?: string;
    isActive: boolean;
}

const staffSchema = new Schema<IStaff>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, trim: true, lowercase: true },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const StaffModel = model<IStaff>("Staff", staffSchema);
