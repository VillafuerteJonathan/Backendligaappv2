// src/modules/movil/partido.controller.js
import db from '../../../config/db.js';
import partidoService from './partido.service.js';

class PartidoController {

  // Obtener campeonatos activos
  async obtenerCampeonatosActivos(req, res) {
    try {
      const resultado = await partidoService.obtenerCampeonatosActivosVocal();
      res.json({ success: true, data: resultado.data, total: resultado.total });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Obtener todos los partidos por campeonato
  async obtenerPartidosPendientes(req, res) {
    try {
      const { campeonatoId } = req.params;

      // Llamar al servicio: ya trae todos los partidos sin filtros ni paginación
      const resultado = await partidoService.obtenerPartidosPendientes(campeonatoId);

      // Responder al frontend
      res.json({
        success: true,
        partidos: resultado.partidos,
        total: resultado.partidos.length,
        pagina: 1,
        totalPaginas: 1
      });

    } catch (error) {
      console.error("Error en obtenerPartidosPendientes:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Obtener detalle de un partido
  async obtenerPartidoDetalle(req, res) {
    try {
      const { idPartido } = req.params;
      const resultado = await partidoService.obtenerDetallePartido(idPartido);
      if (!resultado.success) return res.status(404).json(resultado);
      res.json({ success: true, data: resultado.data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Registrar resultado del partido
  async registrarResultado(req, res) {
    try {
      const { idPartido } = req.params;
      const datos = req.body;
      const vocalId = req.user?.id;

      if (!vocalId) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      // Validaciones
      if (datos.inasistencia && !['local', 'visitante'].includes(datos.inasistencia)) {
        return res.status(400).json({ success: false, message: 'Inasistencia inválida' });
      }
      if (!datos.inasistencia && (datos.goles_local == null || datos.goles_visitante == null)) {
        return res.status(400).json({ success: false, message: 'Se requieren goles_local y goles_visitante' });
      }

      const verificar = await partidoService.verificarPartidoYaRegistrado(idPartido);
      if (verificar.ya_registrado) {
        return res.status(400).json({ success: false, message: 'Partido ya registrado', data: verificar.data });
      }

      const resultado = await partidoService.registrarResultadoPartido(idPartido, datos, vocalId);
      res.json({ success: true, data: resultado });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Historial de partidos por vocal
  async obtenerHistorial(req, res) {
    try {
      const vocalId = req.user?.id;
      if (!vocalId) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const filtros = req.query;
      const resultado = await partidoService.obtenerHistorialVocal(vocalId, filtros);
      res.json({ success: true, data: resultado.data, total: resultado.total });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Verificar integridad de acta
  async verificarIntegridad(req, res) {
    try {
      const { idPartido } = req.params;
      const resultado = await partidoService.verificarIntegridadActa(idPartido);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Estadísticas del vocal
  async obtenerEstadisticasVocal(req, res) {
    try {
      const vocalId = req.user?.id;
      if (!vocalId) return res.status(401).json({ success: false, message: 'Usuario no autenticado' });

      const query = `
        SELECT 
          COUNT(*) as total_partidos,
          SUM(CASE WHEN p.estado = 'finalizado' THEN 1 ELSE 0 END) as partidos_finalizados,
          SUM(CASE WHEN p.inasistencia IS NOT NULL THEN 1 ELSE 0 END) as partidos_walkover,
          COUNT(DISTINCT p.id_campeonato) as campeonatos_participados,
          MIN(p.created_at) as primer_registro,
          MAX(p.created_at) as ultimo_registro
        FROM partidos p
        INNER JOIN actas_blockchain ab ON p.id_partido = ab.id_partido
        WHERE ab.vocal_id = $1
      `;
      const result = await db.query(query, [vocalId]);
      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Verificar si un partido ya fue registrado
  async verificarPartidoYaRegistrado(req, res) {
    try {
      const { idPartido } = req.params;
      const resultado = await partidoService.verificarPartidoYaRegistrado(idPartido);
      res.json(resultado);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Conteo de estados por campeonato
  async obtenerConteoEstados(req, res) {
    try {
      const { campeonatoId } = req.params;
      const query = `
        SELECT estado, COUNT(*) as cantidad
        FROM partidos p
        INNER JOIN campeonatos c ON p.id_campeonato = c.id_campeonato
        WHERE p.id_campeonato = $1 AND c.estado = true
        GROUP BY estado
      `;
      const result = await db.query(query, [campeonatoId]);

      const conteo = { en_juego: 0, pendiente: 0, finalizado: 0 };
      result.rows.forEach(r => { conteo[r.estado] = parseInt(r.cantidad); });
      conteo.total = conteo.en_juego + conteo.pendiente + conteo.finalizado;

      res.json({ success: true, data: conteo });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

// Exporta la instancia CORRECTA
export default new PartidoController();
