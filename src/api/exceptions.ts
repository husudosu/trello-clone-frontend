type Error = {
    [key: string]: string[];
};

export interface ValidationErrorResponse {
    message: string;
    errors: Error;
}

export interface InternalServerErrorResponse {
    message: string;
    exception: string;
    traceback: string;
}

export class ValidationError extends Error {
    errors: Error;

    constructor(responseData: ValidationErrorResponse) {
        super(responseData.message);
        Object.setPrototypeOf(this, ValidationError.prototype);

        this.errors = responseData.errors;
    }

    formatErrors() {
        let retval = "<ul>";
        for (const [k, v] of Object.entries(this.errors))
            retval += `<li>${k}: ${v}</li>`;
        retval += "</ul>";
        return retval;
    }
}

export class InternalServerError extends Error {
    exception: string;
    traceback: string;

    constructor(responseData: InternalServerErrorResponse) {
        super(responseData.message);
        Object.setPrototypeOf(this, InternalServerError.prototype);

        this.exception = responseData.exception;
        this.traceback = responseData.traceback;
    }
}