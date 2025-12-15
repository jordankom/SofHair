// BACKEND
// Middleware JWT : vérifie le token et injecte req.user
// ✅ Fix : on lit "sub" (car c'est ce que tu mets dans jwt.sign)

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";
import { UserRole } from "../models/user.model";

// Payload réel du token (tu utilises "sub")
interface JwtPayload {
    sub: string;        //  id user
    role: UserRole;
    iat?: number;
    exp?: number;
}

export interface AuthenticatedRequest extends Request {
    user?: { id: string; role: UserRole };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        //  token absent => 401
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token manquant ou invalide." });
        }

        const token = authHeader.split(" ")[1];

        //  vérification signature
        const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

        //  on normalise vers { id, role } partout dans l’app
        req.user = { id: payload.sub, role: payload.role };

        next();
    } catch (error) {
        console.error("Erreur middleware Auth :", (error as Error).message);
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
}

export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== "owner") {
        return res.status(403).json({ message: "Accès réservé au propriétaire." });
    }
    next();
}
