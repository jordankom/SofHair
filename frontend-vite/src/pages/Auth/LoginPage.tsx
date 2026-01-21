// FRONTEND
// Page de connexion :
// - email + mot de passe
// - appelle le backend
// - stocke le token + user dans le AuthContext
// - redirige vers /client ou /owner selon le rôle
// - lien vers la page d'inscription

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginRequest } from "../../services/authService";
import { useAuth } from "../../context/AuthContext.tsx";
import TextInput from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import "../../styles/pages/_auth.scss";

const LoginPage: React.FC = () => {
    // Champs du formulaire
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // États pour l'UX
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Si on vient d'une route protégée, on voudra renvoyer l'utilisateur là-bas
    const state = location.state as { from?: string } | undefined;


    // Comme ça, après login client tu restes sur la page d’accueil avec le menu "Mon compte".
    const from = state?.from || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await loginRequest(email, password);

            // On met à jour le contexte d'auth
            login(res.token, res.user);

            // Redirection selon rôle
            if (res.user.role === "owner") {
                navigate("/owner/appointments", { replace: true });
            } else {

                navigate(from, { replace: true });
            }
        } catch (err: any) {
            console.error("Erreur login :", err);
            setError("Email ou mot de passe invalide.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h1 className="auth-title">Connexion à SoftHair</h1>
                    <p className="auth-subtitle">
                        Accédez à votre espace client ou propriétaire du salon.
                    </p>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <TextInput
                            label="Adresse email"
                            type="email"
                            placeholder="vous@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <TextInput
                            label="Mot de passe"
                            type="password"
                            placeholder="Votre mot de passe"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && <p className="auth-error">{error}</p>}

                        <Button type="submit" fullWidth disabled={loading}>
                            {loading ? "Connexion..." : "Se connecter"}
                        </Button>
                    </form>

                    <p className="auth-switch">
                        Pas encore de compte ?{" "}
                        <Link to="/register" className="auth-link">
                            Créer un compte
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
