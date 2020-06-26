import { Pipe, PipeTransform, Inject } from '@angular/core';
import { SUB_FORM_ERRORS_TOKEN } from './ngx-sub-form-tokens';

export interface IFormatter {
    (controlDisplayName?: string, data?: any): string;
}

export interface IFormatters {
    [errorKey: string]: IFormatter;
}

@Pipe({ name: 'formatError' })
export class FormatErrorPipe implements PipeTransform {

    constructor(@Inject(SUB_FORM_ERRORS_TOKEN) private readonly formattedErrors: IFormatters) { }

    transform(err: any, controlName?: string) {
        return this.getErrorMessage(this.formattedErrors, err, controlName);
    }

    private getErrorMessage(formattedErrors: any, controlErrors: any, formControlDisplayName?: string) {
        const errors = Object.keys(controlErrors || {});

        if (errors.length) {
            const validatorName: string = errors[0];
            const validationData: any = (controlErrors || {})[validatorName];
            const messager: any = (formattedErrors as any)[validatorName];

            return messager ? messager(formControlDisplayName, validationData).trim() : '';
        }

        return '';
    }
}

