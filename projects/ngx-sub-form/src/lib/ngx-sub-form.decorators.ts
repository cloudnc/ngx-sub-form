import { NgxRootFormComponent, NgxRootFormRemapComponent } from './ngx-root-form.component';

export class DataInputUsedOnWrongPropertyError extends Error {
  constructor(calledOnPropertyKey: string) {
    super(
      `You're trying to apply the "DataInput" decorator on a property called "${calledOnPropertyKey}". That decorator should only be used on a property called "dataInput"`,
    );
  }
}

export function DataInput(): <ControlInterface, FormInterface = ControlInterface>(
  target: NgxRootFormRemapComponent<ControlInterface, FormInterface>,
  propertyKey: string,
) => void;
export function DataInput(): <ControlInterface>(
  target: NgxRootFormComponent<ControlInterface>,
  propertyKey: string,
) => void {
  return function<ControlInterface, FormInterface = ControlInterface>(
    target: NgxRootFormComponent<ControlInterface> | NgxRootFormRemapComponent<ControlInterface, FormInterface>,
    propertyKey: string,
  ) {
    if (propertyKey !== 'dataInput') {
      throw new DataInputUsedOnWrongPropertyError(propertyKey);
    }

    Object.defineProperty(target, propertyKey, {
      set: function(dataInputValue) {
        (this as
          | NgxRootFormComponent<ControlInterface>
          | NgxRootFormRemapComponent<ControlInterface, FormInterface>).dataInputUpdated(dataInputValue);
      },
    });
  };
}
