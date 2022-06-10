import { NgxRootFormComponent } from './ngx-root-form.component';

/**
 * @deprecated
 */
export class DataInputUsedOnWrongPropertyError extends Error {
  constructor(calledOnPropertyKey: string) {
    super(
      `You're trying to apply the "DataInput" decorator on a property called "${calledOnPropertyKey}". That decorator should only be used on a property called "dataInput"`,
    );
  }
}

/**
 * @deprecated
 */
export function DataInput() {
  return function <ControlInterface, FormInterface = ControlInterface>(
    target: NgxRootFormComponent<ControlInterface, FormInterface>,
    propertyKey: string,
  ) {
    if (propertyKey !== 'dataInput') {
      throw new DataInputUsedOnWrongPropertyError(propertyKey);
    }

    Object.defineProperty(target, propertyKey, {
      set: function (dataInputValue) {
        (this as NgxRootFormComponent<ControlInterface, FormInterface>).dataInputUpdated(dataInputValue);
      },
    });
  };
}
