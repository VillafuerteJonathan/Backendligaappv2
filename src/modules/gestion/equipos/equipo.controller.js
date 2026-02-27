import {
  crearEquipo,
  listarEquipos,
  editarEquipo,
  eliminarEquipo,
  habilitarEquipo,
  deshabilitarEquipo
} from "./equipo.service.js";

// =============================
// CREAR
// =============================
export const crear = async (req, res) => {
  try {
    const equipo = await crearEquipo(req.body);
    res.status(201).json({ success: true, data: equipo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =============================
// LISTAR
// =============================
export const listar = async (_req, res) => {
  try {
    const equipos = await listarEquipos();
    res.json({ success: true, data: equipos });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// =============================
// EDITAR
// =============================
export const editar = async (req, res) => {
  try {
    const equipo = await editarEquipo(req.params.id, req.body);
    res.json({ success: true, data: equipo });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// =============================
// ELIMINAR
// =============================
export const eliminar = async (req, res) => {
  try {
    const equipo = await eliminarEquipo(req.params.id);
    res.json({ success: true, data: equipo });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

// =============================
// HABILITAR / DESHABILITAR
// =============================
export const habilitar = async (req, res) => {
  try {
    const equipo = await habilitarEquipo(req.params.id);

    res.json({
      success: true,
      message: "Equipo habilitado correctamente",
      data: equipo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error al habilitar el equipo"
    });
  }
};

/* =============================
   DESHABILITAR
============================= */
export const deshabilitar = async (req, res) => {
  try {
    const equipo = await deshabilitarEquipo(req.params.id);

    res.json({
      success: true,
      message: "Equipo deshabilitado correctamente",
      data: equipo
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Error al deshabilitar el equipo"
    });
  }
};