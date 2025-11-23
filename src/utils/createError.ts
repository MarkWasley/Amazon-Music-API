import { HTTPException } from "hono/http-exception"

type ErrorStatusCode = 
    | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 
    | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 
    | 422 | 423 | 424 | 425 | 426 | 428 | 429 | 431 | 451 
    | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;

export class CustomHTTPException extends HTTPException {
    public detail: string;
    public code: number;

    constructor(status: ErrorStatusCode, message: string = 'Internal Server Error', name: string = 'InternalServerError') {
        super(status, { message });
        this.name = name;
        this.code = status;
        this.detail = `${status}: ${message}`;
    }

    toJSON() {
        return {
            error: {
                name: this.name,
                detail: this.detail,
                code: this.code,
            },
            message: this.message,
            success: false,
        };
    }
}

export function createError(message: string, status: ErrorStatusCode = 500, name: string = 'InternalServerError'): CustomHTTPException {
    return new CustomHTTPException(status, message, name);
}