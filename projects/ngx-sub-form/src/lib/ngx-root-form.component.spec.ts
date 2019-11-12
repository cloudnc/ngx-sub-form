import { NgxRootFormComponent } from './ngx-root-form.component';
import { EventEmitter, Input, Component, Output, DebugElement } from '@angular/core';
import { Controls, ArrayPropertyKey, ArrayPropertyValue } from './ngx-sub-form-utils';
import { FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataInput } from './ngx-sub-form.decorators';
import { NgxFormWithArrayControls } from './ngx-sub-form.types';

interface Vehicle {
  color?: string | null;
  canFire: boolean | null;
  crewMemberCount: number | null;
}

const MIN_CREW_MEMBER_COUNT = 5;
const MAX_CREW_MEMBER_COUNT = 15;

const getDefaultValues = (): Required<Vehicle> => ({
  color: '#ffffff',
  canFire: true,
  crewMemberCount: MIN_CREW_MEMBER_COUNT + 1,
});

const getNewValues = (): Required<Vehicle> => ({
  color: '#000000',
  canFire: false,
  crewMemberCount: MAX_CREW_MEMBER_COUNT - 1,
});

@Component({
  template: `
    <app-root-form
      [disabled]="disabled"
      [vehicle]="vehicle$ | async"
      (vehicleUpdated)="vehicleUpdated($event)"
    ></app-root-form>
  `,
})
class TestWrapperComponent {
  public disabled: boolean | null | undefined = false;

  public vehicle$: BehaviorSubject<Required<Vehicle>> = new BehaviorSubject(getDefaultValues());

  public vehicleUpdated(vehicle: Required<Vehicle>): void {}
}

@Component({
  selector: `app-root-form`,
  template: `
    <form [formGroup]="formGroup">
      <input type="text" data-color [formControlName]="formControlNames.color" />
      <input type="radio" data-can-fire [formControlName]="formControlNames.canFire" value="true" />
      <input type="radio" data-can-fire [formControlName]="formControlNames.canFire" value="false" />
      <input type="number" data-crew-member-count [formControlName]="formControlNames.crewMemberCount" />
    </form>
  `,
})
class RootFormComponent extends NgxRootFormComponent<Vehicle> {
  @DataInput()
  // tslint:disable-next-line:no-input-rename
  @Input('vehicle')
  public dataInput: Required<Vehicle> | null | undefined = null;

  // tslint:disable-next-line:no-output-rename
  @Output('vehicleUpdated')
  public dataOutput: EventEmitter<Vehicle> = new EventEmitter();

  protected getFormControls(): Controls<Vehicle> {
    return {
      color: new FormControl(null),
      canFire: new FormControl(null, [Validators.required]),
      crewMemberCount: new FormControl(null, [
        Validators.min(MIN_CREW_MEMBER_COUNT),
        Validators.max(MAX_CREW_MEMBER_COUNT),
      ]),
    };
  }
}

describe(`NgxRootFormComponent`, () => {
  let componentFixture: ComponentFixture<TestWrapperComponent>;
  let componentDebug: DebugElement;
  let component: TestWrapperComponent;
  let componentForm: RootFormComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TestWrapperComponent, RootFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    componentFixture = TestBed.createComponent(TestWrapperComponent);
    componentDebug = componentFixture.debugElement;
    component = componentFixture.componentInstance;

    componentFixture.detectChanges();

    componentForm = componentDebug.query(By.directive(RootFormComponent)).componentInstance;
  });

  it(`should populate the form with initial values`, () => {
    expect(componentForm.formGroupValues).toEqual(getDefaultValues());
  });

  it(`should update the form values if the input data changes`, () => {
    component.vehicle$.next(getNewValues());
    componentFixture.detectChanges();
    expect(componentForm.formGroupValues).toEqual(getNewValues());
  });

  it(`should receive the new form values when saving the form`, () => {
    const vehicleUpdatedSpy = spyOn(component, 'vehicleUpdated');

    component.vehicle$.next(getNewValues());
    componentFixture.detectChanges();

    componentForm.manualSave();

    expect(vehicleUpdatedSpy).toHaveBeenCalledWith(getNewValues());
  });

  it(`should be able to disable/enable the form via the "disabled" input`, () => {
    expect(componentForm.formGroup.enabled).toBe(true);

    component.disabled = true;
    componentFixture.detectChanges();
    expect(componentForm.formGroup.disabled).toBe(true);

    component.disabled = null;
    componentFixture.detectChanges();
    expect(componentForm.formGroup.enabled).toBe(true);

    component.disabled = undefined;
    componentFixture.detectChanges();
    expect(componentForm.formGroup.enabled).toBe(true);

    component.disabled = false;
    componentFixture.detectChanges();
    expect(componentForm.formGroup.enabled).toBe(true);

    component.disabled = true;
    componentFixture.detectChanges();
    expect(componentForm.formGroup.disabled).toBe(true);
  });

  it(`should not emit the form value when calling manualSave if the form is not valid`, () => {
    component.vehicle$.next({
      ...getDefaultValues(),
      // following property is required
      canFire: null,
    });
    componentFixture.detectChanges();

    const vehicleUpdatedSpy = spyOn(component, 'vehicleUpdated');
    componentForm.manualSave();
    expect(vehicleUpdatedSpy).not.toHaveBeenCalled();
  });
});

@Component({
  template: `
    <app-root-form
      [disabled]="disabled"
      [vehicles]="vehicles$ | async"
      (vehiclesUpdated)="vehiclesUpdated($event)"
    ></app-root-form>
  `,
})
class ArrayTestWrapperComponent {
  public disabled: boolean | null | undefined = false;

  public vehicles$: BehaviorSubject<Required<Vehicle>[]> = new BehaviorSubject([getDefaultValues()]);

  public vehiclesUpdated(vehicle: Required<Vehicle>): void {}
}

interface VehiclesArrayForm {
  vehicles: Vehicle[];
}

@Component({
  selector: `app-root-form`,
  template: ``,
})
class RootFormArrayComponent extends NgxRootFormComponent<Vehicle[], VehiclesArrayForm>
  implements NgxFormWithArrayControls<VehiclesArrayForm> {
  @DataInput()
  // tslint:disable-next-line:no-input-rename
  @Input('vehicles')
  public dataInput: Required<Vehicle[]> | null | undefined = null;

  // tslint:disable-next-line:no-output-rename
  @Output('vehiclesUpdated')
  public dataOutput: EventEmitter<Vehicle[]> = new EventEmitter();

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

  protected transformFromFormGroup(formValue: VehiclesArrayForm): Vehicle[] | null {
    return formValue.vehicles;
  }

  public createFormArrayControl(
    key: ArrayPropertyKey<VehiclesArrayForm> | undefined,
    value: ArrayPropertyValue<VehiclesArrayForm>,
  ): FormControl {
    return new FormControl(value, [Validators.required]);
  }
}

describe(`NgxRootFormComponent with an array`, () => {
  let componentFixture: ComponentFixture<ArrayTestWrapperComponent>;
  let componentDebug: DebugElement;
  let component: ArrayTestWrapperComponent;
  let componentForm: RootFormArrayComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ArrayTestWrapperComponent, RootFormArrayComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    componentFixture = TestBed.createComponent(ArrayTestWrapperComponent);
    componentDebug = componentFixture.debugElement;
    component = componentFixture.componentInstance;

    componentFixture.detectChanges();

    componentForm = componentDebug.query(By.directive(RootFormArrayComponent)).componentInstance;
  });

  it(`should disable all the controls within an array when the disabled property is passed`, () => {
    expect(componentForm.formGroupControls.vehicles.disabled).toBe(false);
    expect(componentForm.formGroupControls.vehicles.at(0).disabled).toBe(false);

    component.disabled = true;
    componentFixture.detectChanges();

    expect(componentForm.formGroupControls.vehicles.disabled).toBe(true);
    expect(componentForm.formGroupControls.vehicles.at(0).disabled).toBe(true);
  });
});
