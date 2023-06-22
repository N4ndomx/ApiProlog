import { Router } from "express";
import {
  ConsultarProlog,
  ConsultarTodo,
  randomCaracteristicas,
  ConsulatCharacterByNombre
} from "../Controllers/controlador.js";

const router = Router();

router.get("/Servidor/buscar", ConsultarTodo);

router.get("/Servidor/character/:personaje", ConsulatCharacterByNombre);
router.post("/Servidor/caracteristicasbypersonaje", randomCaracteristicas );

router.post("/Servidor/prolog", ConsultarProlog);


export default router;
