import JuegosService from './juegos.service.js';

class JuegosController {

  async listarJuegos(req, res) {
    try {
      const data = await JuegosService.obtenerDashboard();

      return res.status(200).json({
        ok: true,
        data
      });

    } catch (error) {
      console.error('❌ Error listar juegos:', error);
      return res.status(500).json({
        ok: false,
        message: 'Error al obtener los partidos'
      });
    }
  }

}

export default new JuegosController();