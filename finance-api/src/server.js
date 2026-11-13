import app from './app.js';
import { initDB } from './config/db.js';

const PORT = process.env.PORT || 3002;

try {
    initDB();

    app.listen(PORT, () => {
        console.log(`Finance API is running on http://localhost:${PORT}`);
    });
} catch (error) {
    console.error('Failed to initialize Finance API:', error);
    process.exit(1);
}