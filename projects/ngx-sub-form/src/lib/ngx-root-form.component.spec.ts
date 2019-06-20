import { NgxRootFormComponent } from './ngx-root-form.component';
import { EventEmitter, Input, Component, Output, DebugElement } from '@angular/core';
import { Controls } from './ngx-sub-form-utils';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TestBed, async, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataInput } from './ngx-sub-form.decorators';

interface Vehicle {
  color?: string | null;
  canFire: boolean | null;
  numberOfCrewMembersOnBoard: number | null;
}

const MIN_NUMBER_OF_CREW_MEMBERS_ON_BOARD = 5;
const MAX_NUMBER_OF_CREW_MEMBERS_ON_BOARD = 15;

const getDefaultValues = (): Required<Vehicle> => ({
  color: '#ffffff',
  canFire: true,
  numberOfCrewMembersOnBoard: 10,
});

const getNewValues = (): Required<Vehicle> => ({
  color: '#000000',
  canFire: false,
  numberOfCrewMembersOnBoard: 100,
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
      <input
        type="number"
        data-number-of-crew-members-on-board
        [formControlName]="formControlNames.numberOfCrewMembersOnBoard"
      />
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
      numberOfCrewMembersOnBoard: new FormControl(null, [
        Validators.min(MIN_NUMBER_OF_CREW_MEMBERS_ON_BOARD),
        Validators.max(MAX_NUMBER_OF_CREW_MEMBERS_ON_BOARD),
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
});
