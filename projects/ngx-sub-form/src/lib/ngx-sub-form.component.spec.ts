/// <reference types="jasmine" />

import { FormControl, Validators } from '@angular/forms';
import { NgxSubFormComponent, NgxSubFormRemapComponent } from './ngx-sub-form.component';

interface Vehicle {
  color?: string | null;
  canFire: boolean | null;
  numberOfPeopleOnBoard: number | null;
}

const MIN_NUMBER_OF_PEOPLE_ON_BOARD = 5;
const MAX_NUMBER_OF_PEOPLE_ON_BOARD = 15;

const getDefaultValues = (): Required<Vehicle> => ({
  color: '#ffffff',
  canFire: true,
  numberOfPeopleOnBoard: 10,
});

class SubComponent extends NgxSubFormComponent<Vehicle> {
  getFormControls() {
    // even though optional, if we comment out color there should be a TS error
    return {
      color: new FormControl(getDefaultValues().color),
      canFire: new FormControl(getDefaultValues().canFire),
      numberOfPeopleOnBoard: new FormControl(getDefaultValues().numberOfPeopleOnBoard, [
        Validators.min(MIN_NUMBER_OF_PEOPLE_ON_BOARD),
        Validators.max(MAX_NUMBER_OF_PEOPLE_ON_BOARD),
      ]),
    };
  }
}

describe(`NgxSubFormComponent`, () => {
  let subComponent: SubComponent;

  beforeEach((done: () => void) => {
    subComponent = new SubComponent();

    // we have to call `updateValueAndValidity` within the constructor in an async way
    // and here we need to wait for it to run
    setTimeout(() => {
      done();
    }, 0);
  });

  describe(`created`, () => {
    it(`should have the formControlNames defined, even for optional fields`, () => {
      expect(subComponent.formControlNames).toEqual({
        color: 'color',
        canFire: 'canFire',
        numberOfPeopleOnBoard: 'numberOfPeopleOnBoard',
      });
    });

    it(`should create a formGroup property with all the formControls`, () => {
      expect(subComponent.formGroup.get('random')).toBeNull();

      expect(subComponent.formGroup.get(subComponent.formControlNames.canFire)).not.toBeNull();
      expect(subComponent.formGroup.get(subComponent.formControlNames.color)).not.toBeNull();
      expect(subComponent.formGroup.get(subComponent.formControlNames.numberOfPeopleOnBoard)).not.toBeNull();
    });

    it(`should create a formGroupControls property to easily access all the formControls`, () => {
      // following should not compile because random is not defined
      // expect(subComponent.controls.random).toBeNull();

      expect(subComponent.formGroupControls.canFire).not.toBeNull();
      expect(subComponent.formGroupControls.color).not.toBeNull();
      expect(subComponent.formGroupControls.numberOfPeopleOnBoard).not.toBeNull();
    });

    it(`should create a formGroupValues property to easily access all the values individually`, () => {
      // following should not compile because random is not defined
      // expect(subComponent.formGroupValues.random).toBeNull();

      expect(subComponent.formGroupValues.canFire).toEqual(true);
      expect(subComponent.formGroupValues.color).toEqual('#ffffff');
      expect(subComponent.formGroupValues.numberOfPeopleOnBoard).toEqual(10);
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
      (subComponent.formGroup.get(subComponent.formControlNames.numberOfPeopleOnBoard) as FormControl).setValue(
        MIN_NUMBER_OF_PEOPLE_ON_BOARD - 1,
      );
      expect(subComponent.validate()).toEqual({
        [subComponent.formControlNames.numberOfPeopleOnBoard]: { min: { min: 5, actual: 4 } },
      });
    });

    it(`should give access to a formGroupErrors property`, () => {
      // set one of the control to be invalid
      (subComponent.formGroup.get(subComponent.formControlNames.numberOfPeopleOnBoard) as FormControl).setValue(
        MIN_NUMBER_OF_PEOPLE_ON_BOARD - 1,
      );
      expect(subComponent.formGroupErrors).toEqual({
        [subComponent.formControlNames.numberOfPeopleOnBoard]: { min: { min: 5, actual: 4 } },
      } as any);
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
      it(`should set the form value`, () => {});
    });

    describe(`value is not null nor undefined`, () => {
      // we should be able to pass a value `false`, or an empty string for ex
      it(`should set the value even if the value is falsy`, () => {
        subComponent.formGroup.setValue = jasmine.createSpy();
        subComponent.writeValue(false as any);
        expect(subComponent.formGroup.setValue).toHaveBeenCalledTimes(1);

        subComponent.writeValue('' as any);
        expect(subComponent.formGroup.setValue).toHaveBeenCalledTimes(2);
      });

      // setValue will make sure the object matches the shape of the interface and will error otherwise
      it(`should use the setValue method instead of patchValue`, () => {
        subComponent.formGroup.setValue = jasmine.createSpy();
        subComponent.writeValue(false as any);
        expect(subComponent.formGroup.setValue).toHaveBeenCalledTimes(1);
      });

      // when a parent set the form value, he's already aware of it and we do not want to update it upstream for no reason
      it(`should have the option "emitEvent" set to false`, () => {
        subComponent.formGroup.setValue = jasmine.createSpy();
        subComponent.writeValue('some value' as any);
        expect(subComponent.formGroup.setValue).toHaveBeenCalledWith('some value', {
          emitEvent: false,
        });
      });

      // if we create a new object using the form and at some point we decide to edit another one
      // we should have everything back to pristine
      it(`should mark the form as pristine`, () => {
        subComponent.formGroup.markAsDirty();
        expect(subComponent.formGroup.pristine).toBe(false);

        subComponent.writeValue({ canFire: true, color: '#ffffff', numberOfPeopleOnBoard: 10 });
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

    it(`should call onChange and onTouched callback on next tick every time the form value changes`, (done: () => void) => {
      const onTouchedSpy = jasmine.createSpy('onTouchedSpy');
      const onChangeSpy = jasmine.createSpy('onChangeSpy');

      subComponent.registerOnTouched(onTouchedSpy);
      subComponent.registerOnChange(onChangeSpy);

      subComponent.formGroup.setValue(getDefaultValues());

      setTimeout(() => {
        expect(onTouchedSpy).toHaveBeenCalledTimes(1);
        expect(onChangeSpy).toHaveBeenCalledTimes(2);
        expect(onChangeSpy).toHaveBeenCalledWith(getDefaultValues());

        done();
      }, 0);
    });
  });
});

interface VehiculeForm {
  vehiculeColor: Vehicle['color'] | null;
  vehiculeCanFire: Vehicle['canFire'] | null;
  vehiculeNumberOfPeopleOnBoard: Vehicle['numberOfPeopleOnBoard'] | null;
}

class SubRemapComponent extends NgxSubFormRemapComponent<Vehicle, VehiculeForm> {
  getFormControls() {
    // even though optional, if we comment out vehiculeColor there should be a TS error
    return {
      vehiculeColor: new FormControl(getDefaultValues().color),
      vehiculeCanFire: new FormControl(getDefaultValues().canFire),
      vehiculeNumberOfPeopleOnBoard: new FormControl(getDefaultValues().numberOfPeopleOnBoard),
    };
  }

  protected transformToFormGroup(obj: Vehicle | null): VehiculeForm {
    return {
      vehiculeColor: obj ? obj.color : null,
      vehiculeCanFire: obj ? obj.canFire : null,
      vehiculeNumberOfPeopleOnBoard: obj ? obj.numberOfPeopleOnBoard : null,
    };
  }

  protected transformFromFormGroup(formValue: VehiculeForm): Vehicle | null {
    return {
      color: formValue.vehiculeColor,
      canFire: formValue.vehiculeCanFire,
      numberOfPeopleOnBoard: formValue.vehiculeNumberOfPeopleOnBoard,
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
            vehiculeColor: getDefaultValues().color,
            vehiculeCanFire: getDefaultValues().canFire,
            vehiculeNumberOfPeopleOnBoard: getDefaultValues().numberOfPeopleOnBoard,
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
        numberOfPeopleOnBoard: getDefaultValues().numberOfPeopleOnBoard,
      };

      expect(onChangeSpy).not.toHaveBeenCalled();

      setTimeout(() => {
        expect(onChangeSpy).toHaveBeenCalledWith(expectedValue);

        onChangeSpy.calls.reset();

        subRemapComponent.formGroup.setValue({
          vehiculeColor: getDefaultValues().color,
          vehiculeCanFire: getDefaultValues().canFire,
          vehiculeNumberOfPeopleOnBoard: getDefaultValues().numberOfPeopleOnBoard,
        });

        setTimeout(() => {
          expect(onChangeSpy).toHaveBeenCalledWith(expectedValue);

          done();
        }, 0);
      }, 0);
    });
  });
});
