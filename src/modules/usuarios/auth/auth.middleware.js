import { AuthService } from './auth.service.js';

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, message: 'No autorizado' });

    const token = authHeader.split(' ')[1];
    req.user = await AuthService.verifyToken(token);
    next();
  } catch (err) {
    res.status(err.status || 401).json({ success: false, message: err.message });
  }
};
