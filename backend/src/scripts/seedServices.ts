import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model";
import { ServiceModel } from "../models/service.model";

function pick<T>(arr: T[]) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function rand(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) throw new Error("MONGO_URI manquant");

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connecté à MongoDB");

    // 1) OWNER
    const ownerEmail = "owner@softhair.com";
    const ownerPassword = "password123";

    const existingOwner = await UserModel.findOne({ email: ownerEmail });

    if (!existingOwner) {
        const passwordHash = await bcrypt.hash(ownerPassword, 10);
        await UserModel.create({
            email: ownerEmail,
            passwordHash,
            firstName: "Jordan",
            lastName: "Owner",
            role: "owner",
        });
        console.log("✅ Owner créé :", ownerEmail);
    } else {
        console.log("ℹ️ Owner déjà présent :", ownerEmail);
    }

    // 2) SERVICES (100)
    const categories = [
        "Coupe Femme",
        "Coupe Homme",
        "Enfant",
        "Brushing",
        "Coloration",
        "Balayage",
        "Soin",
        "Lissage",
        "Barbe",
        "Coiffure Événement",
    ];

    const names = [
        "Coupe classique",
        "Coupe + brushing",
        "Dégradé",
        "Dégradé + barbe",
        "Brushing volume",
        "Coloration racines",
        "Coloration complète",
        "Balayage naturel",
        "Soin profond",
        "Lissage kératine",
        "Chignon",
        "Waves",
    ];

    // await ServiceModel.deleteMany({});
    // console.log("🧹 Prestations supprimées");

    const existingCount = await ServiceModel.countDocuments();
    const target = 100;
    const toCreate = Math.max(0, target - existingCount);

    if (toCreate === 0) {
        console.log(" Il y a déjà", existingCount, "prestations (>=100).");
    } else {
        const docs = Array.from({ length: toCreate }).map((_, i) => {
            const category = pick(categories);
            const baseName = pick(names);
            const price = rand(15, 150);
            const durationMinutes = pick([15, 30, 45, 60, 75, 90, 120]);

            // une image différente par service :
            const imageUrl = `https://picsum.photos/seed/softhair-${existingCount + i}/800/600`;

            return {
                name: `${baseName} #${existingCount + i + 1}`,
                category,
                price,
                durationMinutes,
                description: `Prestation "${baseName}" dans la catégorie "${category}".`,
                imageUrl,
                isActive: true,
            };
        });

        await ServiceModel.insertMany(docs);
        console.log(`✅ ${toCreate} prestations créées (total ≈ ${existingCount + toCreate}).`);
    }

    await mongoose.disconnect();
    console.log("✅ Terminé");
}

main().catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
});
