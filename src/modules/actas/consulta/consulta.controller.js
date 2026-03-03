// consulta.controller.js

import {
  obtenerCampeonatosDisponibles,
  obtenerPartidosRevisadosPorCampeonato
} from "./consulta.service.js";

export const ConsultaController = {

  async listarCampeonatos(req, res) {
    try {
      const data = await obtenerCampeonatosDisponibles();
      res.json({ success: true, data });
    } catch (error) {
      console.error("Error listarCampeonatos:", error);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  },

  async listarPartidosPorCampeonato(req, res) {
    try {
      const { id } = req.params;

      const data = await obtenerPartidosRevisadosPorCampeonato(id);

      res.json({ success: true, data });
    } catch (error) {
      console.error("Error listarPartidos:", error);
      res.status(500).json({ success: false, message: "Error interno" });
    }
  }

};