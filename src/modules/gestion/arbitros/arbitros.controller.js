import * as arbitrosService from "./arbitros.service.js";

// ============================================
// CREAR ÁRBITRO
// ============================================
export const crearArbitroController = async (req, res) => {
  const result = await arbitrosService.crearArbitro(req.body);

  // ❌ Validación de negocio (cédula duplicada, etc.)
  if (!result.success) {
    return res.status(200).json({
      success: false,
      message: result.message,
    });
  }

  // ✅ Registro exitoso
  res.status(201).json({
    success: true,
    data: result.data,
    message: "Árbitro creado exitosamente",
  });
};

// ============================================
// LISTAR ÁRBITROS (NO ELIMINADOS)
// ============================================
export const listarArbitrosController = async (req, res) => {
  const arbitros = await arbitrosService.listarArbitros();

  res.status(200).json({
    success: true,
    data: arbitros,
    count: arbitros.length,
    message:
      arbitros.length > 0
        ? "Árbitros obtenidos exitosamente"
        : "No hay árbitros registrados",
  });
};

// ============================================
// EDITAR ÁRBITRO
// ============================================
export const editarArbitroController = async (req, res) => {
  const { id } = req.params;
  const result = await arbitrosService.editarArbitro(id, req.body);

  if (!result.success) {
    return res.status(200).json({
      success: false,
      message: result.message,
    });
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: "Árbitro editado exitosamente",
  });
};

// ============================================
// ELIMINAR ÁRBITRO (SOFT DELETE)
// ============================================
export const eliminarArbitroController = async (req, res) => {
  const { id } = req.params;
  const result = await arbitrosService.eliminarArbitro(id);

  if (!result.success) {
    return res.status(200).json({
      success: false,
      message: result.message,
    });
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: "Árbitro eliminado correctamente",
  });
};

// ============================================
// HABILITAR ÁRBITRO
// ============================================
export const habilitarArbitroController = async (req, res) => {
  const { id } = req.params;
  const result = await arbitrosService.habilitarArbitro(id);

  if (!result.success) {
    return res.status(200).json({
      success: false,
      message: result.message,
    });
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: "Árbitro habilitado correctamente",
  });
};

// ============================================
// DESHABILITAR ÁRBITRO
// ============================================
export const deshabilitarArbitroController = async (req, res) => {
  const { id } = req.params;
  const result = await arbitrosService.deshabilitarArbitro(id);

  if (!result.success) {
    return res.status(200).json({
      success: false,
      message: result.message,
    });
  }

  res.status(200).json({
    success: true,
    data: result.data,
    message: "Árbitro deshabilitado correctamente",
  });
};
