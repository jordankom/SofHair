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

    //  NOUVEAU : prix final payé (calculé au moment de la création)
    pricePaid?: number;

    //  NOUVEAU : infos promo appliquée (optionnel)
    promoApplied?: {
        promoId: Types.ObjectId;
        name: string;
        type: "percent" | "amount";
        value: number;
    };
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

        // Stockage du prix final
        pricePaid: { type: Number },

        //  Promo appliquée (si existante)
        promoApplied: {
            promoId: { type: Schema.Types.ObjectId, ref: "Promotion" },
            name: { type: String },
            type: { type: String, enum: ["percent", "amount"] },
            value: { type: Number },
        },
    },
    { timestamps: true }
);

// Empêche 2 RDV au même startAt pour le même coiffeur
appointmentSchema.index({ staffId: 1, startAt: 1, status: 1 });

export const AppointmentModel = model<IAppointment>("Appointment", appointmentSchema);
