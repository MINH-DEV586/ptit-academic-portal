import db from '../config/db.js';

export const paymentRepository = {
    getPaymentByRef: (transactionRef) => {
        return db.prepare('SELECT id FROM payments WHERE transactionRef = ?').get(transactionRef);
    },

    getTotalPaidByTuitionId: (tuitionFeeId) => {
        const result = db.prepare('SELECT SUM(amountPaid) as totalPaid FROM payments WHERE tuitionFeeId = ?').get(tuitionFeeId);
        return result.totalPaid || 0;
    },

    createPayment: (tuitionFeeId, amountPaid, paymentDate, transactionRef) => {
        db.prepare(`
            INSERT INTO payments (tuitionFeeId, amountPaid, paymentDate, transactionRef)
            VALUES (?, ?, ?, ?)
        `).run(tuitionFeeId, amountPaid, paymentDate, transactionRef);
    },
    
    getPaymentsByTuitionId: (tuitionFeeId) => {
        return db.prepare('SELECT * FROM payments WHERE tuitionFeeId = ? ORDER BY paymentDate DESC').all(tuitionFeeId);
    }
};