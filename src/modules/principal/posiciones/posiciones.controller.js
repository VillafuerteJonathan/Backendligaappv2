import CampeonatosPosicionesService 
  from "./posiciones.service.js";

class CampeonatosPosicionesController {

  static async obtenerTablas(req, res) {
    try {
      const data =
        await CampeonatosPosicionesService.obtenerCampeonatosActivosConTablas();

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.error("❌ Error tablas posiciones:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener tablas de posiciones"
      });
    }
  }
}

export default CampeonatosPosicionesController;
