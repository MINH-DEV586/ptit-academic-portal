import { tuitionService } from '../services/tuitionService.js';

export const getTuitionsByStudentId = (req, res) => {
    const { studentId } = req.params;

    try {
        const summaryData = tuitionService.getStudentTuitionSummary(studentId);
        
        return res.json({
            success: true,
            data: {
                studentId,
                summary: {
                    totalDebt: summaryData.totalDebt,
                    totalPaid: summaryData.totalPaid
                },
                semesters: summaryData.semesters
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi truy vấn học phí' }
        });
    }
};