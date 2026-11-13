import db from '../config/db.js';

export const tuitionRepository = {
    getTuitionsWithPayments: (studentId) => {
        const sql = `
            SELECT
                tf.id AS tuitionFeeId,
                tf.semester,
                tf.totalAmount,
                tf.dueDate,
                COALESCE(SUM(p.amountPaid), 0) AS paidAmount
            FROM tuition_fees tf
            LEFT JOIN payments p
                ON tf.id = p.tuitionFeeId
            WHERE tf.studentId = ?
            GROUP BY tf.id
            ORDER BY tf.semester;
        `;
        return db.prepare(sql).all(studentId);
    },
    
    getTuitionById: (tuitionFeeId) => {
        return db.prepare('SELECT id, totalAmount, status FROM tuition_fees WHERE id = ?').get(tuitionFeeId);
    },

    updateTuitionStatus: (status, tuitionFeeId) => {
        db.prepare('UPDATE tuition_fees SET status = ? WHERE id = ?').run(status, tuitionFeeId);
    }
};