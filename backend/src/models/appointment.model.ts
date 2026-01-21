import { Schema, model, Document, Types } from "mongoose";

export type AppointmentStatus = "booked" | "cancelled";

export interface IAppointment extends Document {
    userId: Types.ObjectId;
    serviceId: Types.ObjectId;
    staffId: Types.ObjectId;
    startAt: Date;
    endAt: Date;
    status: AppointmentStatus;
    rescheduleCount?: number;
}

const appointmentSchema = new Schema<IAppointment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
        staffId: { type: Schema.Types.ObjectId, ref: "Staff", required: true },
        startAt: { type: Date, required: true },
        endAt: { type: Date, required: true },
        status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
        rescheduleCount: { type: Number, default: 0 },
    },
    { timestamps: true }
);

//  Empêche 2 RDV au même startAt POUR LE MÊME COIFFEUR
appointmentSchema.index({ staffId: 1, startAt: 1, status: 1 });

export const AppointmentModel = model<IAppointment>("Appointment", appointmentSchema);
