import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./finance.db');

// BẮT BUỘC: Bật Foreign Keys
db.exec('PRAGMA foreign_keys = ON;');

export function initDB() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS tuition_fees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId TEXT NOT NULL,
            semester TEXT NOT NULL,
            totalAmount INTEGER NOT NULL CHECK (totalAmount >= 0),
            dueDate TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'UNPAID' CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID')),
            UNIQUE(studentId, semester)
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tuitionFeeId INTEGER NOT NULL,
            amountPaid INTEGER NOT NULL CHECK (amountPaid > 0),
            paymentDate TEXT NOT NULL,
            transactionRef TEXT NOT NULL UNIQUE,
            FOREIGN KEY (tuitionFeeId) REFERENCES tuition_fees(id) ON DELETE RESTRICT
        );

        CREATE INDEX IF NOT EXISTS idx_tuition_student ON tuition_fees(studentId);
        CREATE INDEX IF NOT EXISTS idx_payment_tuition ON payments(tuitionFeeId);
    `);
    console.log('Finance Database initialized.');
}

export default db;