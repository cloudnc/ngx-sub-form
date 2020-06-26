import { InjectionToken } from '@angular/core';
import { NgxSubFormComponent } from './ngx-sub-form.component';
import { IFormatters } from './ngx-error.pipe';

// ----------------------------------------------------------------------------------------
// no need to expose that token out of the lib, do not export that file from public_api.ts!
// ----------------------------------------------------------------------------------------

// see https://github.com/angular/angular/issues/8277#issuecomment-263029485
// this basically allows us to access the host component
// from a directive without knowing the type of the component at run time
export const SUB_FORM_COMPONENT_TOKEN = new InjectionToken<NgxSubFormComponent<any>>('NgxSubFormComponentToken');
export const SUB_FORM_ERRORS_TOKEN = new InjectionToken<IFormatters>('NgxSubFormErrorsToken');
