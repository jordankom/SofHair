// FRONTEND
// Page de création de compte :
// - prénom, nom, email, mot de passe, confirmation
// - appelle le backend /auth/register
// - stocke immédiatement le token + user
// - redirige vers /client (rôle client par défaut)
// - lien pour retourner à la connexion

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextInput from '../../components/ui/TextInput';
import Button from '../../components/ui/Button';
import { registerRequest } from '../../services/authService';
import { useAuth } from '../../context/AuthContext.tsx';
import '../../styles/pages/_auth.scss';

const RegisterPage: React.FC = () => {
    // Champs du formulaire
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName]   = useState('');
    const [email, setEmail]         = useState('');
    const [password, setPassword]   = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // États UX
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);

        try {
            const res = await registerRequest({
                email,
                password,
                confirmPassword,
                firstName,
                lastName,
            });

            // On connecte directement l'utilisateur après inscription
            login(res.token, res.user);

            // Comme c'est un client, on l'envoie sur client
            navigate('/', { replace: true });
        } catch (err: any) {
            console.error('Erreur register :', err);

            // Gestion simple des messages
            if (err.response?.status === 409) {
                setError('Cet email est déjà utilisé.');
            } else {
                setError("Une erreur est survenue lors de la création du compte.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
        <div className="auth-container">
        <div className="auth-card">
        <h1 className="auth-title">Créer un compte SoftHair</h1>
    <p className="auth-subtitle">
        Réservez vos rendez-vous, consultez votre historique et gardez vos préférences à portée de main.
    </p>

    <form className="auth-form" onSubmit={handleSubmit}>
        {/* Ligne avec Prénom + Nom (en deux colonnes sur grand écran) */}
        <div className="auth-form__row">
    <TextInput
        label="Prénom"
    placeholder="Ex : Sarah"
    value={firstName}
    onChange={(e) => setFirstName(e.target.value)}
    />
    <TextInput
    label="Nom"
    placeholder="Ex : Martin"
    value={lastName}
    onChange={(e) => setLastName(e.target.value)}
    />
    </div>

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
    placeholder="Au moins 8 caractères"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    />

    <TextInput
        label="Confirmer le mot de passe"
    type="password"
    placeholder="Répétez votre mot de passe"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    required
    />

    {error && <p className="auth-error">{error}</p>}

        <Button type="submit" fullWidth disabled={loading}>
        {loading ? 'Création du compte...' : 'Créer mon compte'}
        </Button>
        </form>

        <p className="auth-switch">
        Déjà un compte ?{' '}
        <Link to="/login" className="auth-link">
        Se connecter
    </Link>
    </p>
    </div>
    </div>
    </div>
);
};

    export default RegisterPage;
