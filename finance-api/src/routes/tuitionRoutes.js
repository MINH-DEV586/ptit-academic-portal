import express from 'express';
import { getTuitionsByStudentId } from '../controllers/tuitionController.js';
import { getPaymentsByTuition } from '../controllers/paymentController.js';

const router = express.Router();

router.get('/:studentId', getTuitionsByStudentId);
router.get('/:tuitionFeeId/payments', getPaymentsByTuition);

export default router;