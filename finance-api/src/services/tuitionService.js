import { tuitionRepository } from '../repositories/tuitionRepository.js';

export const tuitionService = {
    getStudentTuitionSummary: (studentId) => {
        const tuitions = tuitionRepository.getTuitionsWithPayments(studentId);
        
        const semesters = tuitions.map(item => {
            const remainingAmount = item.totalAmount - item.paidAmount;
            return {
                ...item,
                remainingAmount,
                status: item.paidAmount === 0 ? 'UNPAID' : remainingAmount === 0 ? 'PAID' : 'PARTIAL'
            };
        });

        const totalDebt = semesters.reduce((sum, item) => sum + item.remainingAmount, 0);
        const totalPaid = semesters.reduce((sum, item) => sum + item.paidAmount, 0);

        return { totalDebt, totalPaid, semesters };
    }
};