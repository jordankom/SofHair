import "dotenv/config";
import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import dayjs from "dayjs";

import { UserModel } from "../models/user.model";
import { ServiceModel } from "../models/service.model";
import { PromotionModel } from "../models/promotion.model";
import { AppointmentModel } from "../models/appointment.model";
import { StaffModel } from "../models/staff.model";

/**
 * =========================================================
 * CONFIG
 * =========================================================
 */

const OWNER_EMAIL = "owner@softhair.com";
const OWNER_PASSWORD = "password123";

const NB_CLIENTS = 25;
const NB_STAFF = 6;

const PAST_DAYS = 45;
const FUTURE_DAYS = 14;

const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;

const APPOINTMENTS_TARGET = 220;

// % annulations
const CANCEL_RATE_PAST = 0.18;
const CANCEL_RATE_FUTURE = 0.06;

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function mulberry32(seed: number) {
    return function () {
        let t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const rand = mulberry32(42);

function pick<T>(arr: T[]): T {
    return arr[Math.floor(rand() * arr.length)];
}
function chance(p: number) {
    return rand() < p;
}
function int(min: number, max: number) {
    return Math.floor(rand() * (max - min + 1)) + min;
}

function normalizeEuro(n: number) {
    return Math.max(0, Math.round(n * 100) / 100);
}

function applyPromo(price: number, promo?: { type: "percent" | "amount"; value: number } | null) {
    if (!promo) return normalizeEuro(price);
    if (promo.type === "percent") return normalizeEuro(price * (1 - promo.value / 100));
    return normalizeEuro(price - promo.value);
}

function buildSlotMinutes(stepMinutes = 30) {
    const out: number[] = [];
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
        for (let m = 0; m < 60; m += stepMinutes) out.push(h * 60 + m);
    }
    return out;
}
const SLOT_MINUTES = buildSlotMinutes(30);

/**
 * =========================================================
 * MAIN
 * =========================================================
 */

async function main() {
    const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://jordankom4_db_user:Réussite100@cluster0.ywwo2ir.mongodb.net/softhair?appName=Cluster0";
    if (!MONGO_URI) throw new Error("MONGO_URI manquant");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    /**
     * 1) OWNER
     */
    let owner = await UserModel.findOne({ email: OWNER_EMAIL });
    if (!owner) {
        const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 10);
        owner = await UserModel.create({
            email: OWNER_EMAIL,
            passwordHash,
            firstName: "Jordan",
            lastName: "Owner",
            role: "owner",
        });
        console.log("✅ Owner créé:", OWNER_EMAIL);
    } else {
        console.log("ℹ️ Owner déjà présent:", OWNER_EMAIL);
    }

    /**
     * 2) SERVICES
     */
    const services = await ServiceModel.find({ isActive: true }).lean();
    if (services.length === 0) throw new Error("Aucun service actif en DB. Seed tes prestations d’abord.");
    console.log(`✅ Services actifs trouvés: ${services.length}`);

    /**
     * 3) PROMOTIONS
     */
    await PromotionModel.deleteMany({});
    const promoDocs = await PromotionModel.insertMany([
        {
            name: "Promo -10% Janvier",
            type: "percent",
            value: 10,
            targetType: "all",
            isActive: true,
            startAt: dayjs().subtract(10, "day").toDate(),
            endAt: dayjs().add(10, "day").toDate(),
        },
        {
            name: "Brushing -5€",
            type: "amount",
            value: 5,
            targetType: "category",
            targetCategory: "Brushing",
            isActive: true,
            startAt: dayjs().subtract(30, "day").toDate(),
            endAt: dayjs().add(30, "day").toDate(),
        },
        {
            name: "Ancienne promo inactive",
            type: "percent",
            value: 15,
            targetType: "all",
            isActive: false,
            startAt: dayjs().subtract(90, "day").toDate(),
            endAt: dayjs().subtract(60, "day").toDate(),
        },
    ]);
    console.log(`✅ Promotions créées: ${promoDocs.length}`);

    function findPromoForService(service: any) {
        const now = dayjs();
        const active = promoDocs.filter((p: any) => {
            if (!p.isActive) return false;
            if (p.startAt && now.isBefore(dayjs(p.startAt))) return false;
            if (p.endAt && now.isAfter(dayjs(p.endAt))) return false;
            return true;
        });

        const byService = active.find(
            (p: any) => p.targetType === "service" && String(p.targetServiceId) === String(service._id)
        );
        if (byService) return byService;

        const byCat = active.find((p: any) => p.targetType === "category" && p.targetCategory === service.category);
        if (byCat) return byCat;

        const all = active.find((p: any) => p.targetType === "all");
        return all || null;
    }

    /**
     * 4) CLIENTS
     */
    await UserModel.deleteMany({ role: "client" });
    console.log("🧹 Clients supprimés");

    const clientDocs = await UserModel.insertMany(
        Array.from({ length: NB_CLIENTS }).map((_, i) => ({
            email: `client${i + 1}@softhair.com`,
            passwordHash: bcrypt.hashSync("password123", 10),
            firstName: pick(["Emma", "Lina", "Sarah", "Ines", "Maya", "Chloé", "Noah", "Lucas", "Adam", "Hugo"]),
            lastName: pick(["Martin", "Dupont", "Bernard", "Moreau", "Leroy", "Petit", "Roux", "Fournier", "Girard"]),
            role: "client",
        }))
    );
    console.log(`✅ Clients créés: ${clientDocs.length}`);

    /**
     * 5) STAFF
     */
    await StaffModel.deleteMany({});
    console.log("🧹 Staff supprimés");

    const staffDocs = await StaffModel.insertMany(
        Array.from({ length: NB_STAFF }).map(() => ({
            firstName: pick(["Nina", "Lola", "Jade", "Sofia", "Manon", "Léa", "Tom", "Yanis"]),
            lastName: pick(["Coiffure", "Style", "Beauty", "Studio", "Hair", "Pro"]),
            isActive: true,
        }))
    );
    console.log(`✅ Staff créés: ${staffDocs.length}`);

    const staffIds = staffDocs.map((s: any) => s._id as Types.ObjectId);

    /**
     * 6) APPOINTMENTS (status: booked | cancelled uniquement)
     */
    await AppointmentModel.deleteMany({});
    console.log("🧹 RDV supprimés");

    const usedSlots = new Map<string, Set<number>>();

    function reserveSlot(staffId: Types.ObjectId, day: dayjs.Dayjs, startMinute: number, duration: number) {
        const key = `${String(staffId)}_${day.format("YYYY-MM-DD")}`;
        const set = usedSlots.get(key) ?? new Set<number>();
        const endMinute = startMinute + duration;

        for (let m = startMinute; m < endMinute; m += 5) {
            if (set.has(m)) return false;
        }
        for (let m = startMinute; m < endMinute; m += 5) set.add(m);

        usedSlots.set(key, set);
        return true;
    }

    const startDay = dayjs().subtract(PAST_DAYS, "day").startOf("day");
    const allDaysCount = PAST_DAYS + FUTURE_DAYS + 1;

    const appts: any[] = [];
    let guard = 0;

    while (appts.length < APPOINTMENTS_TARGET && guard < APPOINTMENTS_TARGET * 80) {
        guard++;

        const day = startDay.add(int(0, allDaysCount - 1), "day");
        const isPastDay = day.isBefore(dayjs(), "day");

        const staffId = pick(staffIds);
        const client = pick(clientDocs as any[]);
        const service = pick(services as any[]);

        const duration = Number(service.durationMinutes || 30);
        const startMinute = pick(SLOT_MINUTES);
        const endMinute = startMinute + duration;

        if (endMinute > CLOSE_HOUR * 60) continue;
        if (!reserveSlot(staffId, day, startMinute, duration)) continue;

        const startAt = day.add(startMinute, "minute").toDate();
        const endAt = day.add(endMinute, "minute").toDate();

        const status: "booked" | "cancelled" = isPastDay
            ? (chance(CANCEL_RATE_PAST) ? "cancelled" : "booked")
            : (chance(CANCEL_RATE_FUTURE) ? "cancelled" : "booked");

        const promo = findPromoForService(service);
        const basePrice = Number(service.price || 0);
        const finalPrice = applyPromo(basePrice, promo ? { type: promo.type, value: promo.value } : null);

        const pricePaid = status === "cancelled" ? 0 : finalPrice;

        appts.push({
            userId: client._id,
            serviceId: service._id,
            staffId,
            startAt,
            endAt,
            status,
            pricePaid,
            promoApplied: promo
                ? {
                    promoId: promo._id,
                    name: promo.name,
                    type: promo.type,
                    value: promo.value,
                }
                : undefined,
        });
    }

    await AppointmentModel.insertMany(appts);
    console.log(`✅ RDV créés: ${appts.length}`);

    await mongoose.disconnect();
    console.log("✅ Seed stats terminé");
}

main().catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
});
