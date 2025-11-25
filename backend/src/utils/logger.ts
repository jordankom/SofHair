// Centralise les fonctions de log (utile si tu passes plus tard à Winston, Pino, etc.)

export function logInfo(...args: unknown[]): void {
    console.log('[INFO]', ...args);
}

export function logError(...args: unknown[]): void {
    console.error('[ERROR]', ...args);
}
