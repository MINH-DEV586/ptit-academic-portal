import db, { initDB } from '../config/db.js';

console.log('Khởi tạo database...');
initDB();

console.log('Đang nạp dữ liệu mẫu...');
try {
    db.exec('BEGIN IMMEDIATE');
    
    // Kiểm tra SV2022001 HK1
    const tuition1 = db.prepare('SELECT id FROM tuition_fees WHERE studentId = ? AND semester = ?').get('SV2022001', '2023-2024 HK1');
    if (!tuition1) {
        const result = db.prepare('INSERT INTO tuition_fees (studentId, semester, totalAmount, dueDate, status) VALUES (?, ?, ?, ?, ?)').run('SV2022001', '2023-2024 HK1', 15000000, '2023-10-15', 'UNPAID');
        const tuitionFeeId = Number(result.lastInsertRowid);
        db.prepare('INSERT INTO payments (tuitionFeeId, amountPaid, paymentDate, transactionRef) VALUES (?, ?, ?, ?)').run(tuitionFeeId, 5000000, '2023-09-20T08:30:00Z', 'TXN123456789');
        db.prepare('UPDATE tuition_fees SET status = ? WHERE id = ?').run('PARTIAL', tuitionFeeId);
    }
    
    // Kiểm tra SV2022001 HK2
    const tuition2 = db.prepare('SELECT id FROM tuition_fees WHERE studentId = ? AND semester = ?').get('SV2022001', '2023-2024 HK2');
    if (!tuition2) {
        db.prepare('INSERT INTO tuition_fees (studentId, semester, totalAmount, dueDate, status) VALUES (?, ?, ?, ?, ?)').run('SV2022001', '2023-2024 HK2', 15000000, '2024-03-15', 'UNPAID');
    }

    db.exec('COMMIT');
    console.log('Nạp dữ liệu mẫu thành công!');
} catch (error) {
    db.exec('ROLLBACK');
    console.error('Lỗi khi nạp dữ liệu:', error.message);
}