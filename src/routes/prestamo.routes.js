import { Router } from 'express';
import { 
  getBeneficiarios, 
  getBeneficiarioById, 
  createBeneficiario, 
  updateBeneficiario, 
  deleteBeneficiario 
} from '../controllers/beneficiarioController.js';
import { 
  getContratos, 
  getContratoById, 
  createContrato, 
  updateContrato, 
  deleteContrato
} from '../controllers/contratoController.js';
import { 
  getCronogramaPagos 
} from '../controllers/pagosController.js'; // Nueva importación

const router = Router();

// Rutas para beneficiarios
router.get('/beneficiarios', getBeneficiarios);
router.get('/beneficiarios/:id', getBeneficiarioById);
router.post('/beneficiarios', createBeneficiario);
router.put('/beneficiarios/:id', updateBeneficiario);
router.delete('/beneficiarios/:id', deleteBeneficiario);

// Rutas para contratos
router.get('/contratos', getContratos);
router.get('/contratos/:id', getContratoById);
router.post('/contratos', createContrato);
router.put('/contratos/:id', updateContrato);
router.delete('/contratos/:id', deleteContrato);

// Nueva ruta para cronograma de todos los contratos
router.get('/pagos/cronograma', getCronogramaPagos);

export default router;