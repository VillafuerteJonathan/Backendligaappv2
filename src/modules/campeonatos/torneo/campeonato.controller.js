import { validate as isUUID } from "uuid";
import CampeonatosService from "./campeonato.service.js";
import EquiposService from "./equipos.service.js";

class CampeonatosController {

  // =========================
  // VALIDACIONES
  // =========================
  static #validar(datos, parcial = false) {
    const errores = [];

    if (!parcial || datos.nombre) {
      if (!datos.nombre?.trim()) errores.push("Nombre requerido");
      else if (datos.nombre.trim().length < 3) errores.push("Nombre muy corto");
    }

    if (!parcial || datos.fecha_inicio) {
      if (!datos.fecha_inicio) errores.push("Fecha inicio requerida");
      else if (isNaN(new Date(datos.fecha_inicio))) errores.push("Fecha inicio inválida");
    }

    if (!parcial || datos.fecha_fin) {
      if (!datos.fecha_fin) errores.push("Fecha fin requerida");
      else if (isNaN(new Date(datos.fecha_fin))) errores.push("Fecha fin inválida");
    }

    if (datos.fecha_inicio && datos.fecha_fin) {
      const inicio = new Date(datos.fecha_inicio);
      const fin = new Date(datos.fecha_fin);
      if (fin <= inicio) errores.push("Fecha fin debe ser posterior a inicio");
    }

    if (!parcial || datos.grupos) {
      if (!Array.isArray(datos.grupos)) errores.push("Grupos deben ser un array");
      else {
        datos.grupos.forEach((g, i) => {
          if (!g.nombre?.trim()) errores.push(`Grupo ${i + 1} sin nombre`);
          if (g.equiposIds && !Array.isArray(g.equiposIds)) {
            errores.push(`Grupo "${g.nombre}" equipos deben ser array`);
          }
        });
      }
      const hoy = new Date();
hoy.setHours(0, 0, 0, 0);

if (datos.fecha_inicio) {
  const inicio = new Date(datos.fecha_inicio);
  inicio.setHours(0, 0, 0, 0);

  if (inicio < hoy) {
    errores.push("La fecha de inicio no puede ser anterior a hoy");
  }
}

    }

    return errores;
    
  }

  
  static #manejarError(error, res) {
    console.error(error);
    if (error.message?.includes("no encontrado")) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message?.includes("duplicado")) {
      return res.status(409).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: "Error interno" });
  }

  // =========================
  // CRUD CAMPEONATOS
  // =========================
  static async crear(req, res) {
  try {
    const errores = this.#validar(req.body); // ✅ PRIMERO

    if (errores.length) {
      return res.status(400).json({
        success: false,
        errors: errores
      });
    }

    const campeonato =
      await CampeonatosService.crearOCambiarCampeonatoCompleto(req.body);

    res.status(201).json({
      success: true,
      data: campeonato
    });

  } catch (e) {
    this.#manejarError(e, res);
  }
}

  static async actualizar(req, res) {
    try {
      const { id } = req.params;

      if (!id || !isUUID(id)) {
        return res.status(400).json({ success: false, error: "ID inválido" });
      }
           const campeonatoActual = await CampeonatosService.obtenerConDetalles(id);
      if (!campeonatoActual) {
        return res.status(404).json({ success: false, error: "No encontrado" });
      }

      const hoy = new Date();
      const inicio = new Date(campeonatoActual.fecha_inicio);

      if (inicio <= hoy) {
        return res.status(409).json({
          success: false,
          error: "El campeonato ya inició, no se puede editar"
        });
      }
      const errores = this.#validar(req.body, true);
      if (errores.length) {
        return res.status(400).json({ success: false, errors: errores });
      }

      const campeonato =
        await CampeonatosService.crearOCambiarCampeonatoCompleto(req.body, id);

      res.json({ success: true, data: campeonato });

    } catch (e) {
      this.#manejarError(e, res);
    }
  }

  static async obtenerTodos(req, res) {
    try {
      const campeonatos = await CampeonatosService.obtenerTodos();
      res.json({ success: true, data: campeonatos });
    } catch (e) {
      this.#manejarError(e, res);
    }
  }

  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id || !isUUID(id)) {
        return res.status(400).json({ success: false, error: "ID inválido" });
      }

      const campeonato = await CampeonatosService.obtenerConDetalles(id);
      if (!campeonato) {
        return res.status(404).json({ success: false, error: "No encontrado" });
      }

      res.json({ success: true, data: campeonato });

    } catch (e) {
      this.#manejarError(e, res);
    }
  }

  static async eliminar(req, res) {
    try {
      const { id } = req.params;

      if (!id || !isUUID(id)) {
        return res.status(400).json({ success: false, error: "ID inválido" });
      }

      // 🔒 BLOQUEO POR FECHA DE INICIO
      const campeonato = await CampeonatosService.obtenerConDetalles(id);
      if (!campeonato) {
        return res.status(404).json({ success: false, error: "No encontrado" });
      }

      const hoy = new Date();
      const inicio = new Date(campeonato.fecha_inicio);

      if (inicio <= hoy) {
        return res.status(409).json({
          success: false,
          error: "El campeonato ya inició, no se puede eliminar"
        });
      }
      await CampeonatosService.eliminar(id);
      res.json({ success: true, message: "Campeonato eliminado" });

    } catch (e) {
      this.#manejarError(e, res);
    }
  }

  // =========================
  // GRUPOS / EQUIPOS
  // =========================
  static async obtenerEquiposGrupo(req, res) {
    try {
      const { idCampeonato, idGrupo } = req.params;

      if (!isUUID(idCampeonato)) {
        return res.status(400).json({ success: false, error: "ID campeonato inválido" });
      }

      const idG = parseInt(idGrupo);
      if (isNaN(idG)) {
        return res.status(400).json({ success: false, error: "ID grupo inválido" });
      }

      const [disponibles, asignados] = await Promise.all([
        EquiposService.obtenerDisponiblesParaGrupo(idCampeonato, idG),
        EquiposService.obtenerEnGrupo(idCampeonato, idG)
      ]);

      res.json({ success: true, data: { disponibles, asignados } });

    } catch (e) {
      this.#manejarError(e, res);
    }
  }

  static async agregarEquipoAGrupo(req, res) {
    try {
      const { idCampeonato, idGrupo } = req.params;
      const { idEquipo } = req.body;

      if (!isUUID(idCampeonato)) {
        return res.status(400).json({ success: false, error: "ID campeonato inválido" });
      }

      const idG = parseInt(idGrupo);
      const idE = parseInt(idEquipo);

      if (isNaN(idG) || isNaN(idE)) {
        return res.status(400).json({ success: false, error: "ID inválido" });
      }

      const valid = await EquiposService.puedeAgregarAGrupo(idE, idCampeonato, idG);
      if (!valid.puede) {
        return res.status(400).json({ success: false, error: valid.razon });
      }

      await EquiposService.agregarAGrupo(idCampeonato, idG, idE);
      res.json({ success: true, message: "Equipo agregado" });

    } catch (e) {
      this.#manejarError(e, res);
    }
  }

  static async removerEquipoDeGrupo(req, res) {
    try {
      const { idCampeonato, idGrupo, idEquipo } = req.params;

      if (!isUUID(idCampeonato)) {
        return res.status(400).json({ success: false, error: "ID campeonato inválido" });
      }

      const idG = parseInt(idGrupo);
      const idE = parseInt(idEquipo);

      if (isNaN(idG) || isNaN(idE)) {
        return res.status(400).json({ success: false, error: "ID inválido" });
      }

      await EquiposService.removerDeGrupo(idCampeonato, idG, idE);
      res.json({ success: true, message: "Equipo removido" });

    } catch (e) {
      this.#manejarError(e, res);
    }
  }
static async generarPartidos(req, res) {
  try {
    const { id } = req.params;

    if (!id || !isUUID(id)) {
      return res.status(400).json({
        success: false,
        error: "ID campeonato inválido"
      });
    }

    await CampeonatosService.generarPartidos(id);

    res.json({
      success: true,
      message: "Partidos generados correctamente"
    });

  } catch (e) {
    this.#manejarError(e, res);
  }
}
}
export default CampeonatosController;
