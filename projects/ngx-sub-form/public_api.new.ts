/*
 * Public API Surface of sub-form
 */

// in order to **not** bring a breaking change with the rewrite
// to allow incremental updates, we publish the library using
// 2 different paths: `ngx-sub-form` and `ngx-sub-form/new`
// as within the `new` package we use shared functionalities
// coming from the old code, we need to have the root of the lib
// higher than the `new` folder, see following issue
// https://github.com/ng-packagr/ng-packagr/issues/358#issuecomment-524504864

export * from './new/src/helpers';
export * from './new/src/helpers.types';
export * from './new/src/ngx-sub-form';
export { FormType } from './new/src/ngx-sub-form.types';
export * from './src/lib/shared/ngx-sub-form-utils';
export * from './src/lib/shared/ngx-sub-form.types';
