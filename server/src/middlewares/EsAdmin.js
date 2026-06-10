export const isAdmin = (req, res, next) => {
    // El 'req.user' vendrá de tu middleware de validación de JWT previo
    if (!req.user || req.user.rol !== "Administrador") {
        return res.status(403).json({ message: "Acceso rechazado: se requieren permisos de administrador" });
    }
    next();
};