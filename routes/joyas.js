import express from "express";
import { getJoyas, getJoyasFiltradas } from '../controllers/joyasController.js';

const router = express.Router();

router.get('/', getJoyas);
router.get('/filtros', getJoyasFiltradas);



export default router;
