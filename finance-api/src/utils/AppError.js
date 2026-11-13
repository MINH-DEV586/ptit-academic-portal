export class AppError extends Error {
    constructor(status, code, message, details = null) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        
        // Bảo toàn stack trace (dành cho môi trường dev/debug)
        Error.captureStackTrace(this, this.constructor);
    }
}