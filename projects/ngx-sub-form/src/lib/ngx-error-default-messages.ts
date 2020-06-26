import { IFormatters } from "./ngx-error.pipe";

function format(msg: string, displayName?: string) {
    return displayName ? `${displayName || ''} ${(msg || '').toLowerCase()}` : msg;
}

export const errorDefaultMessages: IFormatters = {
    max: (displayName?: string, data?: any) => format(`Cannot be more than ${data?.max}`, displayName),
    maxlength: (displayName?: string, data?: any) =>
        format(`Must be less than ${data?.requiredLength} characters`, displayName),
    min: (displayName?: string, data?: any) => format(`Must be at least ${data?.min}`, displayName),
    minlength: (displayName?: string, data?: any) =>
        format(`Must be at least ${data?.requiredLength} characters`, displayName),
    required: (displayName?: string) => (displayName ? `${displayName} is required` : 'Required'),
    pattern: (displayName?: string) => format('Contains invalid characters', displayName),
    unique: (displayName?: string) => format('Must be unique', displayName),
};
