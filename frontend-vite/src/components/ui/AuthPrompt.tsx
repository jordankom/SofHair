// FRONTEND
// ─────────────────────────────────────────────────────────
// Composant : AuthPrompt
// Rôle : Afficher une carte lorsque l'utilisateur clique sur "Prendre RDV"
//        alors qu'il n'est PAS connecté.
//        La carte propose de se connecter ou créer un compte.
// ─────────────────────────────────────────────────────────

import React from 'react';
import Card from './Card';
import Button from './Button';
import '../../styles/components/_authPrompt.scss';
import { useNavigate } from 'react-router-dom';

interface AuthPromptProps {
    onClose: () => void; // Fonction pour fermer la popup
}

const AuthPrompt: React.FC<AuthPromptProps> = ({ onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="auth-prompt-backdrop" onClick={onClose}>
            {/* On empêche la fermeture si on clique sur la carte */}
            <div className="auth-prompt-wrapper" onClick={e => e.stopPropagation()}>

                {/* Carte centrale */}
                <Card className="auth-prompt">
                    <h2 className="auth-prompt__title">Connexion requise</h2>

                    <p className="auth-prompt__text">
                        Pour prendre rendez-vous, vous devez être connecté(e).
                        Connectez-vous si vous avez déjà un compte, ou créez-en un en quelques secondes.
                    </p>

                    {/* Boutons */}
                    <div className="auth-prompt__actions">
                        <Button variant="primary" onClick={() => navigate('/login')}>
                            Se connecter
                        </Button>

                        <Button variant="secondary" onClick={() => navigate('/register')}>
                            Créer un compte
                        </Button>
                    </div>

                    {/* Bouton de fermeture */}
                    <button className="auth-prompt__close" onClick={onClose}>
                        Fermer
                    </button>
                </Card>
            </div>
        </div>
    );
};

export default AuthPrompt;
