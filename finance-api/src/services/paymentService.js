import db from '../config/db.js';
import { paymentRepository } from '../repositories/paymentRepository.js';
import { tuitionRepository } from '../repositories/tuitionRepository.js';
import { AppError } from '../utils/AppError.js';

export const paymentService = {
    processPaymentTransaction: (tuitionFeeId, amountPaid, transactionRef) => {
        let transactionStarted = false;
        try {
            db.exec('BEGIN IMMEDIATE');
            transactionStarted = true;

            const existingTx = paymentRepository.getPaymentByRef(transactionRef);
            if (existingTx) {
                throw new AppError(409, 'DUPLICATE_TRANSACTION', 'Mã giao dịch này đã được ghi nhận trước đó');
            }

            const tuition = tuitionRepository.getTuitionById(tuitionFeeId);
            if (!tuition) {
                throw new AppError(404, 'TUITION_NOT_FOUND', 'Không tìm thấy khoản học phí cần thanh toán');
            }

            if (tuition.status === 'PAID') {
                throw new AppError(400, 'ALREADY_PAID', 'Khoản học phí này đã được thanh toán đủ');
            }

            const totalPaidBefore = paymentRepository.getTotalPaidByTuitionId(tuitionFeeId);

            if (totalPaidBefore + amountPaid > tuition.totalAmount) {
                throw new AppError(400, 'OVERPAYMENT', 'Số tiền nộp vượt mức công nợ', {
                    totalAmount: tuition.totalAmount,
                    paidBefore: totalPaidBefore,
                    remaining: tuition.totalAmount - totalPaidBefore
                });
            }

            const paymentDate = new Date().toISOString();
            paymentRepository.createPayment(tuitionFeeId, amountPaid, paymentDate, transactionRef);

            const newTotalPaid = totalPaidBefore + amountPaid;
            const newStatus = newTotalPaid >= tuition.totalAmount ? 'PAID' : 'PARTIAL';
            tuitionRepository.updateTuitionStatus(newStatus, tuitionFeeId);

            db.exec('COMMIT');
            transactionStarted = false;

            return { tuitionFeeId, transactionRef, amountPaid, paymentDate, newStatus, remainingDebt: tuition.totalAmount - newTotalPaid };

        } catch (error) {
            if (transactionStarted) {
                try { db.exec('ROLLBACK'); } catch (rbError) { console.error('Rollback failed:', rbError); }
            }
            throw error;
        }
    },
    
    getPaymentHistory: (tuitionFeeId) => {
        const tuition = tuitionRepository.getTuitionById(tuitionFeeId);
        if (!tuition) {
             throw new AppError(404, 'TUITION_NOT_FOUND', 'Không tìm thấy khoản học phí');
        }
        return paymentRepository.getPaymentsByTuitionId(tuitionFeeId);
    }
};