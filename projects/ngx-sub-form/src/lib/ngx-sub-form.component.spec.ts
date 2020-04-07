/// <reference types="jasmine" />

import { FormControl, Validators, FormArray } from '@angular/forms';
import {
  FormGroupOptions,
  NgxSubFormComponent,
  NgxSubFormRemapComponent,
  MissingFormControlsError,
  NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES,
  Controls,
  ArrayPropertyKey,
  ArrayPropertyValue,
  NgxFormWithArrayControls,
  NoExtraProperties,
} from '../public_api';
import { Observable } from 'rxjs';

interface Vehicle {
  color?: string | null;
  canFire: boolean | null;
  crewMemberCount: number | null;
}

const vehicleNullValues: Readonly<{ [key in keyof Vehicle]-?: null }> = {
  color: null,
  canFire: null,
  crewMemberCount: null,
};

const MIN_CREW_MEMBER_COUNT = 5;
const MAX_CREW_MEMBER_COUNT = 15;

const getDefaultValues = (): Required<Vehicle> => ({
  color: '#ffffff',
  canFire: true,
  crewMemberCount: 10,
});

class SubComponent extends NgxSubFormComponent<Vehicle> {
  protected getFormControls() {
    // even though optional, if we comment out color there should be a TS error
    return {
      color: new FormControl(getDefaultValues().color),
      canFire: new FormControl(getDefaultValues().canFire),
      crewMemberCount: new FormControl(getDefaultValues().crewMemberCount, [
        Validators.min(MIN_CREW_MEMBER_COUNT),
        Validators.max(MAX_CREW_MEMBER_COUNT),
      ]),
    };
  }
}

const DEBOUNCE_TIMING = 500;

class DebouncedSubComponent extends SubComponent {
  protected handleEmissionRate(): (obs$: Observable<Vehicle>) => Observable<Vehicle> {
    return NGX_SUB_FORM_HANDLE_VALUE_CHANGES_RATE_STRATEGIES.debounce(DEBOUNCE_TIMING);
  }
}

class SubComponentWithDefaultValues extends NgxSubFormComponent<Vehicle> {
  protected getFormControls() {
    return {
      color: new FormControl(),
      canFire: new FormControl(),
      crewMemberCount: new FormControl(null, [
        Validators.min(MIN_CREW_MEMBER_COUNT),
        Validators.max(MAX_CREW_MEMBER_COUNT),
      ]),
    };
  }

  protected getDefaultValues(): Partial<Vehicle> | null {
    return getDefaultValues();
  }
}

describe(`Common`, () => {
  it(`should call formGroup.updateValueAndValidity only if formGroup is defined`, (done: () => void) => {
    const subComponent: SubComponent = new SubComponent();

    const formGroupSpy = spyOn(subComponent.formGroup, 'updateValueAndValidity');

    expect(formGroupSpy).not.toHaveBeenCalled();

    setTimeout(() => {
      expect(formGroupSpy).toHaveBeenCalled();
      done();
    }, 0);
  });
});

describe(`NgxSubFormComponent`, () => {
  let subComponent: SubComponent;
  let debouncedSubComponent: DebouncedSubComponent;
  let subComponentWithDefaultValues: SubComponentWithDefaultValues;

  beforeEach((done: () => void) => {
    subComponent = new SubComponent();
    debouncedSubComponent = new DebouncedSubComponent();
    subComponentWithDefaultValues = new SubComponentWithDefaultValues();

    // we have to call `updateValueAndValidity` within the constructor in an async way
    // and here we need to wait for it to run
    setTimeout(done);
  });

  describe(`created`, () => {
    it(`should have the formControlNames defined, even for optional fields`, () => {
      expect(subComponent.formControlNames).toEqual({
        color: 'color',
        canFire: 'canFire',
        crewMemberCount: 'crewMemberCount',
      });
    });

    it(`should create a formGroup property with all the formControls`, () => {
      expect(subComponent.formGroup.get('random')).toBeNull();

      expect(subComponent.formGroup.get(subComponent.formControlNames.canFire)).not.toBeNull();
      expect(subComponent.formGroup.get(subComponent.formControlNames.color)).not.toBeNull();
      expect(subComponent.formGroup.get(subComponent.formControlNames.crewMemberCount)).not.toBeNull();
    });

    it(`should create a formGroupControls property to easily access all the formControls`, () => {
      // following should not compile because random is not defined
      // expect(subComponent.controls.random).toBeNull();

      expect(subComponent.formGroupControls.canFire).not.toBeNull();
      expect(subComponent.formGroupControls.color).not.toBeNull();
      expect(subComponent.formGroupControls.crewMemberCount).not.toBeNull();
    });

    it(`should create a formGroupValues property to easily access all the values individually`, () => {
      // following should not compile because random is not defined
      // expect(subComponent.formGroupValues.random).toBeNull();

      expect(subComponent.formGroupValues.canFire).toEqual(true);
      expect(subComponent.formGroupValues.color).toEqual('#ffffff');
      expect(subComponent.formGroupValues.crewMemberCount).toEqual(10);
    });

    it(`should keep all the form values to their default if "getDefaultValues" method is not provided`, () => {
      expect(subComponent.formGroupValues).toEqual(getDefaultValues());
    });

    it(`should set the form to the default values provided by "getDefaultValues" method if provided`, () => {
      expect(subComponentWithDefaultValues.formGroupValues).toEqual(getDefaultValues());
    });
  });

  describe(`destroyed`, () => {
    it(`should set the value of the formGroup to undefined as there's a memory leak with Angular (until it's fixed upstream)`, () => {
      subComponent.ngOnDestroy();
      expect(subComponent.formGroup).toBeUndefined();
    });

    it(`should return null when trying to validate if the formGroup doesn't exit`, () => {
      subComponent.ngOnDestroy();
      subComponent.validate();
      expect(subComponent.formGroup).toBeUndefined();
    });

    it(`should call the onChange callback when destroying the component with null`, () => {
      const spyOnChange = jasmine.createSpy();
      subComponent.registerOnChange(spyOnChange);
      spyOnChange.calls.reset();

      subComponent.ngOnDestroy();
      expect(spyOnChange).toHaveBeenCalledTimes(1);
      expect(spyOnChange).toHaveBeenCalledWith(null);
    });

    it(`should not propagate changes upstream anymore (until previous issue fixed by Angular)`, () => {
      subComponent.ngOnDestroy();
      expect(subComponent.formGroup).toBeUndefined();
    });
  });

  describe(`validation`, () => {
    it(`should validate the field and return an object containing the errors if the formGroup is defined and invalid`, () => {
      // set one of the control to be invalid
      (subComponent.formGroup.get(subComponent.formControlNames.crewMemberCount) as FormControl).setValue(
        MIN_CREW_MEMBER_COUNT - 1,
      );
      expect(subComponent.validate()).toEqual({
        [subComponent.formControlNames.crewMemberCount]: { min: { min: 5, actual: 4 } },
      });
    });

    it(`should give access to a formGroupErrors property`, () => {
      // set one of the control to be invalid
      (subComponent.formGroup.get(subComponent.formControlNames.crewMemberCount) as FormControl).setValue(
        MIN_CREW_MEMBER_COUNT - 1,
      );
      expect(subComponent.formGroupErrors).toEqual({
        [subComponent.formControlNames.crewMemberCount]: { min: { min: 5, actual: 4 } },
      } as any);
    });

    it(`should have the formGroupErrors property set to null if there's no error`, () => {
      expect(subComponent.formGroupErrors).toEqual(null);
    });

    describe(`should validate the field and return null if the formGroup is`, () => {
      it(`not defined`, () => {
        subComponent.ngOnDestroy();
        expect(subComponent.validate()).toBeNull();
      });

      it(`valid or pristine`, () => {
        // by default in that example defined, valid and pristine
        expect(subComponent.validate()).toBeNull();
      });
    });

    // @todo this is not working for now and should be done later
    // it(`should validate the fields recursively`, () => {});
  });

  describe(`value updated by the parent (write)`, () => {
    describe(`value is null or undefined`, () => {
      it(`should reset all form values to null if "getDefaultValues" method is not provided`, () => {
        subComponent.writeValue(null);

        expect(subComponent.formGroupValues).toEqual(vehicleNullValues);
      });

      it(`should reset the form to the default values provided by "getDefaultValues" method if provided`, () => {
        subComponentWithDefaultValues.writeValue(null);

        expect(subComponentWithDefaultValues.formGroupValues).toEqual(getDefaultValues());
      });
    });

    describe(`value is not null nor undefined`, () => {
      // we should be able to pass a value `false`, or an empty string for ex
      it(`should throw an error when the value is missing any of the required keys to create the form`, () => {
        expect(() => subComponent.writeValue({ randomValue: 'ok' } as any)).toThrow(
          new MissingFormControlsError(['color', 'canFire', 'crewMemberCount']),
        );
        expect(() => subComponent.writeValue({ color: '' } as any)).toThrow(
          new MissingFormControlsError(['canFire', 'crewMemberCount']),
        );
        expect(() => subComponent.writeValue({ color: '', canFire: true } as any)).toThrow(
          new MissingFormControlsError(['crewMemberCount']),
        );
      });

      // setValue will make sure the object matches the shape of the interface and will error otherwise
      it(`should use the setValue method instead of patchValue`, () => {
        subComponent.formGroup.setValue = jasmine.createSpy();
        subComponent.writeValue(getDefaultValues());
        expect(subComponent.formGroup.setValue).toHaveBeenCalledTimes(1);
      });

      // when a parent set the form value, he's already aware of it and we do not want to update it upstream for no reason
      it(`should have the option "emitEvent" set to false`, () => {
        subComponent.formGroup.setValue = jasmine.createSpy();
        subComponent.writeValue(getDefaultValues());
        expect(subComponent.formGroup.setValue).toHaveBeenCalledWith(getDefaultValues(), {
          emitEvent: false,
        });
      });

      // if we create a new object using the form and at some point we decide to edit another one
      // we should have everything back to pristine
      it(`should mark the form as pristine`, () => {
        subComponent.formGroup.markAsDirty();
        expect(subComponent.formGroup.pristine).toBe(false);

        subComponent.writeValue({ canFire: true, color: '#ffffff', crewMemberCount: 10 });
        expect(subComponent.formGroup.pristine).toBe(true);
      });
    });
  });

  describe(`value updated by the sub form (onChange)`, () => {
    // @note on-change-after-one-tick
    // we need to wait for one tick otherwise it might in certain case trigger an error
    // `ExpressionChangedAfterItHasBeenCheckedError`
    // see issue here: https://github.com/cloudnc/ngx-sub-form/issues/15
    // repro here: https://github.com/lppedd/ngx-sub-form-test
    // stackblitz here: https://stackblitz.com/edit/ngx-sub-form-repro-issue-15 (might have to download, seems broken on stackblitz)
    it(`should call onChange callback as soon as it's being registered (after one tick)`, (done: () => void) => {
      const spy = jasmine.createSpy();
      subComponent.registerOnChange(spy);

      expect(spy).not.toHaveBeenCalled();

      setTimeout(() => {
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith(getDefaultValues());
        done();
      }, 0);
    });

    it(`should call onChange and onTouched callback on next tick every time one of the form value changes`, (done: () => void) => {
      const onTouchedSpy = jasmine.createSpy('onTouchedSpy');
      const onChangeSpy = jasmine.createSpy('onChangeSpy');

      subComponent.registerOnTouched(onTouchedSpy);
      subComponent.registerOnChange(onChangeSpy);

      subComponent.formGroupControls.color.setValue('red');

      setTimeout(() => {
        expect(onTouchedSpy).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenCalledTimes(2);
        expect(onChangeSpy).toHaveBeenCalledWith({ ...getDefaultValues(), color: 'red' });
        expect(onChangeSpy).toHaveBeenCalledWith({ ...getDefaultValues(), color: 'red' });

        done();
      }, 0);
    });

    it(`should call onChange and onTouched callback **once** on next tick after the form has been updated multiple times in less than the debounce timing`, (done: () => void) => {
      const onTouchedSpy = jasmine.createSpy('onTouchedSpy');
      const onChangeSpy = jasmine.createSpy('onChangeSpy');

      debouncedSubComponent.registerOnTouched(onTouchedSpy);
      debouncedSubComponent.registerOnChange(onChangeSpy);

      debouncedSubComponent.formGroupControls.color.setValue('red');
      debouncedSubComponent.formGroupControls.color.setValue('blue');
      debouncedSubComponent.formGroupControls.color.setValue('green');
      debouncedSubComponent.formGroupControls.color.setValue('yellow');

      setTimeout(() => {
        expect(onTouchedSpy).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenCalledTimes(2);
        expect(onChangeSpy).toHaveBeenCalledWith({ ...getDefaultValues(), color: 'yellow' });

        done();
      }, DEBOUNCE_TIMING + 100);
    });

    it(`should always have the latest value of the form when it changes`, (done: () => void) => {
      const onTouchedSpy = jasmine.createSpy('onTouchedSpy');
      const onChangeSpy = jasmine.createSpy('onChangeSpy');

      subComponent.registerOnTouched(onTouchedSpy);
      subComponent.registerOnChange(onChangeSpy);

      const crewMemberCount: number = getDefaultValues().crewMemberCount || 0;

      setTimeout(() => {
        expect(onChangeSpy.calls.count()).toEqual(1);
        expect(onChangeSpy.calls.argsFor(0)).toEqual([getDefaultValues()]);

        subComponent.formGroupControls.crewMemberCount.setValue(crewMemberCount + 1);
        subComponent.formGroupControls.crewMemberCount.setValue(crewMemberCount + 2);

        setTimeout(() => {
          expect(onChangeSpy.calls.count()).toEqual(3);
          expect(onChangeSpy.calls.argsFor(1)).toEqual([
            { ...getDefaultValues(), crewMemberCount: crewMemberCount + 2 },
          ]);
          expect(onChangeSpy.calls.argsFor(2)).toEqual([
            { ...getDefaultValues(), crewMemberCount: crewMemberCount + 2 },
          ]);

          done();
        }, 0);
      }, 0);
    });
  });

  describe(`enabled/disabled`, () => {
    it(`should recursively disable the forms when disabling a formGroup`, () => {
      expect(subComponent.formGroup.enabled).toBe(true);

      const spyDisable = jasmine.createSpy();
      const spyEnable = jasmine.createSpy();

      subComponent.formGroup.disable = spyDisable;
      subComponent.formGroup.enable = spyEnable;

      subComponent.setDisabledState(true);
      expect(spyDisable).toHaveBeenCalled();
      expect(spyEnable).not.toHaveBeenCalled();

      spyDisable.calls.reset();
      spyEnable.calls.reset();

      subComponent.setDisabledState(false);
      expect(spyDisable).not.toHaveBeenCalled();
      expect(spyEnable).toHaveBeenCalled();
    });
  });

  describe(`onFormUpdate`, () => {
    it(`should not call onFormUpdate when patched by the parent (through "writeValue")`, (done: () => void) => {
      const spyOnFormUpdate = jasmine.createSpy();
      subComponent.onFormUpdate = spyOnFormUpdate;
      subComponent.registerOnChange(() => {});

      setTimeout(() => {
        spyOnFormUpdate.calls.reset();

        subComponent.writeValue({ ...subComponent.formGroupValues, color: 'red' });

        setTimeout(() => {
          expect(spyOnFormUpdate).not.toHaveBeenCalled();

          done();
        }, 0);
      }, 0);
    });

    it(`should call onFormUpdate everytime the form changes (local changes)`, (done: () => void) => {
      const spyOnFormUpdate = jasmine.createSpy();
      subComponent.onFormUpdate = spyOnFormUpdate;
      subComponent.registerOnChange(() => {});

      subComponent.formGroupControls.color.setValue(`red`);

      setTimeout(() => {
        expect(spyOnFormUpdate).toHaveBeenCalledWith({
          color: true,
        });

        done();
      }, 0);
    });

    it(`should correctly emit the onChange value only once when form is patched locally`, (done: () => void) => {
      const spyOnFormUpdate = jasmine.createSpy();
      const spyOnChange = jasmine.createSpy();
      subComponent.onFormUpdate = spyOnFormUpdate;
      subComponent.registerOnChange(spyOnChange);
      (subComponent as any).emitInitialValueOnInit = false;

      subComponent.formGroup.patchValue({ color: 'red', canFire: false });

      setTimeout(() => {
        expect(spyOnFormUpdate).toHaveBeenCalledWith({
          canFire: true,
        });

        expect(spyOnChange).toHaveBeenCalledTimes(1);
        expect(spyOnChange).toHaveBeenCalledWith({ color: 'red', canFire: false, crewMemberCount: 10 });

        done();
      }, 0);
    });
  });

  describe('getFormGroupControlOptions', () => {
    interface Numbered {
      numberOne: number;
      numberTwo: number;
    }

    class ValidatedSubComponent extends NgxSubFormComponent<Numbered> {
      protected getFormControls() {
        return {
          numberOne: new FormControl(null, Validators.required),
          numberTwo: new FormControl(null, Validators.required),
        };
      }

      public getFormGroupControlOptions(): FormGroupOptions<Numbered> {
        return {
          validators: [
            formGroup => {
              const sum = formGroup.value.numberOne + formGroup.value.numberTwo;

              if (sum % 2 !== 0) {
                return {
                  sumMustBeEven: sum,
                };
              }

              return null;
            },
          ],
        };
      }
    }

    interface PasswordForm {
      password: string;
      passwordRepeat: string;
    }

    class PasswordSubComponent extends NgxSubFormComponent<PasswordForm> {
      protected getFormControls() {
        return {
          password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
          passwordRepeat: new FormControl(null, Validators.required),
        };
      }

      public getFormGroupControlOptions(): FormGroupOptions<PasswordForm> {
        return {
          validators: [
            formGroup => {
              if (formGroup.value.password !== formGroup.value.passwordRepeat) {
                return {
                  passwordsMustMatch: true,
                };
              }

              return null;
            },
          ],
        };
      }
    }

    let validatedSubComponent: ValidatedSubComponent;

    beforeEach((done: () => void) => {
      validatedSubComponent = new ValidatedSubComponent();

      // we have to call `updateValueAndValidity` within the constructor in an async way
      // and here we need to wait for it to run
      setTimeout(() => {
        done();
      }, 0);
    });

    it('can declare custom form group level validators, to prevent updating the control', (done: () => void) => {
      const spyOnChange = jasmine.createSpy();
      validatedSubComponent.registerOnChange(spyOnChange);

      validatedSubComponent.formGroup.patchValue({ numberOne: 1, numberTwo: 2 });

      setTimeout(() => {
        expect(validatedSubComponent.validate()).toEqual({ formGroup: { sumMustBeEven: 3 } });
        expect(validatedSubComponent.formGroupErrors).toEqual({ formGroup: { sumMustBeEven: 3 } });

        validatedSubComponent.formGroup.patchValue({ numberOne: 2, numberTwo: 2 });
        setTimeout(() => {
          expect(spyOnChange).toHaveBeenCalledWith({ numberOne: 2, numberTwo: 2 });
          expect(validatedSubComponent.validate()).toEqual(null);
          expect(validatedSubComponent.formGroupErrors).toEqual(null);
          done();
        }, 0);
      }, 0);
    });
  });
});

interface VehicleForm {
  vehicleColor: Vehicle['color'] | null;
  vehicleCanFire: Vehicle['canFire'] | null;
  vehiclecrewMemberCount: Vehicle['crewMemberCount'] | null;
}

class SubRemapComponent extends NgxSubFormRemapComponent<Vehicle, VehicleForm> {
  getFormControls() {
    // even though optional, if we comment out vehicleColor there should be a TS error
    return {
      vehicleColor: new FormControl(getDefaultValues().color),
      vehicleCanFire: new FormControl(getDefaultValues().canFire),
      vehiclecrewMemberCount: new FormControl(getDefaultValues().crewMemberCount),
    };
  }

  protected transformToFormGroup(obj: Vehicle | null): VehicleForm {
    return {
      vehicleColor: obj ? obj.color : null,
      vehicleCanFire: obj ? obj.canFire : null,
      vehiclecrewMemberCount: obj ? obj.crewMemberCount : null,
    };
  }

  protected transformFromFormGroup(formValue: VehicleForm): NoExtraProperties<Vehicle, VehicleForm> | null {
    return {
      color: formValue.vehicleColor,
      canFire: formValue.vehicleCanFire,
      crewMemberCount: formValue.vehiclecrewMemberCount,
    };
  }
}

describe(`NgxSubFormRemapComponent`, () => {
  let subRemapComponent: SubRemapComponent;

  beforeEach((done: () => void) => {
    subRemapComponent = new SubRemapComponent();

    // we have to call `updateValueAndValidity` within the constructor in an async way
    // and here we need to wait for it to run
    setTimeout(() => {
      done();
    }, 0);
  });

  describe(`value updated by the parent (write)`, () => {
    describe(`value is not null nor undefined`, () => {
      it(`should set the form value using the transformer method transformToFormGroup`, () => {
        subRemapComponent.formGroup.setValue = jasmine.createSpy();
        subRemapComponent.writeValue(getDefaultValues());

        expect(subRemapComponent.formGroup.setValue).toHaveBeenCalledWith(
          {
            vehicleColor: getDefaultValues().color,
            vehicleCanFire: getDefaultValues().canFire,
            vehiclecrewMemberCount: getDefaultValues().crewMemberCount,
          },
          {
            emitEvent: false,
          },
        );
      });
    });
  });

  describe(`value updated by the sub form (onChange)`, () => {
    // about the after one tick, see note on-change-after-one-tick
    it(`should call onChange callback with the formValue transformed by the transformFromFormGroup method (after one tick)`, (done: () => void) => {
      const onChangeSpy = jasmine.createSpy('onChangeSpy');

      subRemapComponent.registerOnChange(onChangeSpy);

      const expectedValue: Vehicle = {
        color: getDefaultValues().color,
        canFire: getDefaultValues().canFire,
        crewMemberCount: getDefaultValues().crewMemberCount,
      };

      expect(onChangeSpy).not.toHaveBeenCalled();

      setTimeout(() => {
        expect(onChangeSpy).toHaveBeenCalledWith(expectedValue);

        onChangeSpy.calls.reset();

        const newExpectation = {
          color: 'green',
          canFire: false,
          crewMemberCount: 12,
        };

        subRemapComponent.formGroup.setValue({
          vehicleColor: newExpectation.color,
          vehicleCanFire: newExpectation.canFire,
          vehiclecrewMemberCount: newExpectation.crewMemberCount,
        });

        setTimeout(() => {
          expect(onChangeSpy).toHaveBeenCalledWith(newExpectation);

          done();
        }, 0);
      }, 0);
    });
  });
});

interface VehiclesArrayForm {
  vehicles: Vehicle[];
}

class SubArrayComponent extends NgxSubFormRemapComponent<Vehicle[], VehiclesArrayForm>
  implements NgxFormWithArrayControls<VehiclesArrayForm> {
  protected getFormControls(): Controls<VehiclesArrayForm> {
    return {
      vehicles: new FormArray([]),
    };
  }

  protected transformToFormGroup(obj: Vehicle[] | null): VehiclesArrayForm {
    return {
      vehicles: obj ? obj : [],
    };
  }

  protected transformFromFormGroup(formValue: VehiclesArrayForm): NoExtraProperties<Vehicle[], VehiclesArrayForm> | null {
    return formValue.vehicles;
  }

  public createFormArrayControl(
    key: ArrayPropertyKey<VehiclesArrayForm> | undefined,
    value: ArrayPropertyValue<VehiclesArrayForm>,
  ): FormControl {
    return new FormControl(value, [Validators.required]);
  }
}

describe(`SubArrayComponent`, () => {
  let subArrayComponent: SubArrayComponent;

  beforeEach((done: () => void) => {
    subArrayComponent = new SubArrayComponent();

    // we have to call `updateValueAndValidity` within the constructor in an async way
    // and here we need to wait for it to run
    setTimeout(done);
  });

  it(`should have the 'formControlNames' property returning the name of the 'FormArray' instead of an array`, () => {
    const onChangeSpy = jasmine.createSpy('onChangeSpy');
    subArrayComponent.registerOnChange(onChangeSpy);

    expect(subArrayComponent.formControlNames).toEqual({ vehicles: 'vehicles' });
  });

  it(`should have the correct values within the 'FormArray'`, () => {
    const onChangeSpy = jasmine.createSpy('onChangeSpy');

    subArrayComponent.registerOnChange(onChangeSpy);

    const values = [
      { canFire: true, color: 'color-1', crewMemberCount: 1 },
      { canFire: false, color: 'color-2', crewMemberCount: 2 },
    ];

    subArrayComponent.writeValue(values);

    expect(subArrayComponent.formGroupControls.vehicles.value).toEqual(values);

    const newValue = { canFire: true, color: 'color-3', crewMemberCount: 3 };

    subArrayComponent.writeValue([...values, newValue]);

    expect(subArrayComponent.formGroupControls.vehicles.value).toEqual([...values, newValue]);
  });

  it(`should keep existing 'FormControl's within the array when removing or adding values to the array`, () => {
    const onChangeSpy = jasmine.createSpy('onChangeSpy');

    subArrayComponent.registerOnChange(onChangeSpy);

    const values = [
      { canFire: true, color: 'color-1', crewMemberCount: 1 },
      { canFire: false, color: 'color-2', crewMemberCount: 2 },
    ];

    subArrayComponent.writeValue(values);

    const fc1: FormControl = subArrayComponent.formGroupControls.vehicles.at(0) as FormControl;
    const fc2: FormControl = subArrayComponent.formGroupControls.vehicles.at(1) as FormControl;

    const newValue = { canFire: true, color: 'color-3', crewMemberCount: 3 };

    subArrayComponent.writeValue([...values, newValue]);

    // check the form controls are the exact same instances
    expect(subArrayComponent.formGroupControls.vehicles.at(0)).toBe(fc1);
    expect(subArrayComponent.formGroupControls.vehicles.at(1)).toBe(fc2);

    // check the values are unchanged
    expect(subArrayComponent.formGroupControls.vehicles.at(0).value).toBe(values[0]);
    expect(subArrayComponent.formGroupControls.vehicles.at(1).value).toBe(values[1]);
    expect(subArrayComponent.formGroupControls.vehicles.at(2).value).toBe(newValue);
  });

  it(`should be possible to create a FormControl from the 'createFormArrayControl' hook based on the current property`, () => {
    const createFormArrayControl = spyOn(subArrayComponent, 'createFormArrayControl').and.callThrough();

    const values = [
      { canFire: true, color: 'color-1', crewMemberCount: 1 },
      { canFire: false, color: 'color-2', crewMemberCount: 2 },
    ];

    subArrayComponent.writeValue(values);

    expect(createFormArrayControl).toHaveBeenCalledTimes(2);
    // check values
    expect(createFormArrayControl).toHaveBeenCalledWith('vehicles', values[0]);
    expect(createFormArrayControl).toHaveBeenCalledWith('vehicles', values[1]);
    // check non-default control was created
    expect(subArrayComponent.formGroupControls.vehicles.at(0).validator).not.toBe(null);
  });

  it(`should disable all the controls within an array`, () => {
    subArrayComponent.registerOnChange(jasmine.createSpy());

    const values = [
      { canFire: true, color: 'color-1', crewMemberCount: 1 },
      { canFire: false, color: 'color-2', crewMemberCount: 2 },
    ];

    subArrayComponent.writeValue(values);

    expect(subArrayComponent.formGroupControls.vehicles.disabled).toBe(false);
    expect(subArrayComponent.formGroupControls.vehicles.at(0).disabled).toBe(false);
    expect(subArrayComponent.formGroupControls.vehicles.at(1).disabled).toBe(false);

    subArrayComponent.setDisabledState(true);

    expect(subArrayComponent.formGroupControls.vehicles.disabled).toBe(true);
    expect(subArrayComponent.formGroupControls.vehicles.at(0).disabled).toBe(true);
    expect(subArrayComponent.formGroupControls.vehicles.at(1).disabled).toBe(true);
  });

  it(`should not return an error when a property is a FormArray without any value`, () => {
    subArrayComponent.registerOnChange(jasmine.createSpy());

    subArrayComponent.writeValue([]);

    expect(subArrayComponent.formGroupErrors).toEqual(null);

    subArrayComponent.writeValue([
      // ok
      { canFire: true, color: 'color-1', crewMemberCount: 1 },
      // ok
      { canFire: true, color: 'color-2', crewMemberCount: 10 },
      // ok
      { canFire: true, color: 'color-3', crewMemberCount: 112 },
    ]);

    expect(subArrayComponent.formGroupErrors).toEqual(null);
  });

  it(`should return an error when a property in a FormArray has an error and have null for the other ones in the array`, () => {
    subArrayComponent.registerOnChange(jasmine.createSpy());

    const values: any[] = [
      // nok
      null,
      // ok
      { canFire: true, color: 'color-1', crewMemberCount: 1 },
      // nok
      null,
      // nok
      null,
    ];

    subArrayComponent.writeValue(values);

    expect(subArrayComponent.formGroupErrors).toEqual({
      vehicles: [{ required: true }, null, { required: true }, { required: true }],
    });
  });
});
