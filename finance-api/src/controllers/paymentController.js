import { paymentService } from '../services/paymentService.js';

export const processPayment = (req, res) => {
    const { tuitionFeeId, amountPaid, transactionRef } = req.body;

    if (!Number.isSafeInteger(tuitionFeeId) || tuitionFeeId <= 0) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_TUITION_ID', message: 'Mã học phí không hợp lệ' } });
    }

    if (!Number.isSafeInteger(amountPaid) || amountPaid <= 0) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_AMOUNT', message: 'Số tiền phải là số nguyên dương hợp lệ' } });
    }

    if (typeof transactionRef !== 'string' || transactionRef.trim().length === 0 || transactionRef.trim().length > 100) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_TRANSACTION_REF', message: 'Mã giao dịch không hợp lệ hoặc quá dài' } });
    }

    const normalizedRef = transactionRef.trim();

    try {
        const result = paymentService.processPaymentTransaction(tuitionFeeId, amountPaid, normalizedRef);
        res.json({ success: true, data: result });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message, details: error.details } });
        }
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Không thể xử lý giao dịch' } });
    }
};

export const getPaymentsByTuition = (req, res) => {
    const { tuitionFeeId } = req.params;
    
    // Sử dụng Number thay vì parseInt để chống parse một phần (vd: 123abc)
    const parsedId = Number(tuitionFeeId);
    
    if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
         return res.status(400).json({ success: false, error: { code: 'INVALID_TUITION_ID', message: 'Mã học phí không hợp lệ' } });
    }
    
    try {
        const history = paymentService.getPaymentHistory(parsedId);
        res.json({ success: true, data: history });
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } });
        }
        res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Lỗi khi truy xuất lịch sử' } });
    }
};