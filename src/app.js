import express from "express";
import canchaRoutes from "./modules/gestion/canchas/cancha.routes.js";
import arbitroRoutes from "./modules/gestion/arbitros/arbitros.router.js";
import authRoutes from "./modules/usuarios/auth/auth.routes.js";
import delegadosRouter from './modules/usuarios/delegados/delegados.router.js';
import vocalesRouter from './modules/usuarios/vocales/vocales.router.js';
import categoriasRouter from './modules/campeonatos/categorias/categorias.router.js';
import { UsuarioService } from './modules/usuarios/admin.service.js';
import equiposRoutes from "./modules/gestion/equipos/equipo.routes.js";
import gruposRoutes from "./modules/campeonatos/grupos/grupos.router.js";
import campeonatosRoutes from "./modules/campeonatos/torneo/campeonato.router.js";
import partidosRoutes from "./modules/movil/partidos/partido.routes.js";
import posicionesRouter from "./modules/principal/posiciones/posiciones.routes.js";
import verificarRouter from "./modules/actas/verificacion/verificacion.routes.js";
import registrarRouter from "./modules/movil/registrar/registro.router.js";

import path from "path"
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
// Crear admin al arrancar
//UsuarioService.crearAdmin();

// Rutas
app.use('/api/auth', authRoutes);
app.use("/api/canchas", canchaRoutes);
app.use("/api/arbitros", arbitroRoutes);
app.use('/api/delegados', delegadosRouter);
app.use('/api/vocales', vocalesRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/equipos', equiposRoutes);
app.use('/api/grupos', gruposRoutes);
app.use('/api/campeonatos', campeonatosRoutes);
app.use('/api/partidos', partidosRoutes);
app.use("/api/posiciones", posicionesRouter);
app.use("/api/registro", registrarRouter);
app.use("/api/verificacion", verificarRouter);



app.use(
  "/api/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);

app.listen(3001, () => console.log("Servidor corriendo en puerto 3001"));