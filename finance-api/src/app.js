import express from 'express';
import cors from 'cors';
import tuitionRoutes from './routes/tuitionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

const app = express(); // <--- Dòng này tạo ra biến app chứa hàm listen()

app.use(cors());
app.use(express.json());

// Các endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, service: 'finance-api', status: 'ok' });
});

app.use('/api/tuitions', tuitionRoutes);
app.use('/api/payments', paymentRoutes);

// Fallback lỗi 404
app.use((req, res) => {
    res.status(404).json({ success: false, error: { code: 'ROUTE_NOT_FOUND', message: 'Đường dẫn không tồn tại' } });
});

export default app; // <--- Đưa dòng export vào cuối file này