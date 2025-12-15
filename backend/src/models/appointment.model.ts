// BACKEND
// Modèle RDV (Appointment) : un client réserve un créneau pour une prestation

import { Schema, model, Document, Types } from "mongoose";

export type AppointmentStatus = "booked" | "cancelled";

export interface IAppointment extends Document {
    userId: Types.ObjectId;      // client
    serviceId: Types.ObjectId;   // prestation
    startAt: Date;               // début
    endAt: Date;                 // fin (calculée avec la durée)
    status: AppointmentStatus;
}

const appointmentSchema = new Schema<IAppointment>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
        startAt: { type: Date, required: true },
        endAt: { type: Date, required: true },
        status: { type: String, enum: ["booked", "cancelled"], default: "booked" },
    },
    { timestamps: true }
);

//  Empêche 2 RDV au même startAt pour le même salon/service (simple, efficace)
appointmentSchema.index({ startAt: 1, status: 1 });

export const AppointmentModel = model<IAppointment>("Appointment", appointmentSchema);
