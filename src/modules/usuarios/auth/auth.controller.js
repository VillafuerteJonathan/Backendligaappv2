import { AuthService } from './auth.service.js';

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;
    const data = await AuthService.login({ correo, password });
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};
