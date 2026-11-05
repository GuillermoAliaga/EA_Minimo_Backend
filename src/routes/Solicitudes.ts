import express from 'express';
import controller from '../controllers/Solicitudes';
import VerifyToken from '../middleware/VerifyToken'; // Ajusta la ruta a tu middleware de JWT

const router = express.Router();


router.get('/', VerifyToken, controller.readAllSolicitudes);
router.get('/:id', VerifyToken, controller.getSolicitudById);
router.post('/', VerifyToken, controller.createSolicitud);
router.put('/:id/status', VerifyToken, controller.updateStatus); 

router.delete('/:id', VerifyToken, controller.softDeleteSolicitud);      
router.delete('/hard/:id', VerifyToken, controller.hardDeleteSolicitud); 

export default router;