import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { Controls } from '../shared/ngx-sub-form-utils';
import { NgxAutomaticRootFormComponent } from './ngx-automatic-root-form.component';
import { DataInput } from './ngx-sub-form.decorators';

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
  crewMemberCount: 10,
});

const getNewCorrectValues = (): Required<Vehicle> => ({
  color: '#000000',
  canFire: false,
  crewMemberCount: 15,
});

const getNewIncorrectValues = (): Required<Vehicle> => ({
  color: '#000000',
  canFire: false,
  crewMemberCount: MAX_CREW_MEMBER_COUNT + 1,
});

@Component({
  template: `
    <app-automatic-root-form
      [vehicle]="vehicle$ | async"
      (vehicleUpdated)="vehicleUpdated($event)"
    ></app-automatic-root-form>
  `,
})
class TestWrapperComponent {
  public vehicle$: BehaviorSubject<Required<Vehicle>> = new BehaviorSubject(getDefaultValues());

  public vehicleUpdated(): void {}
}

@Component({
  selector: `app-automatic-root-form`,
  template: `
    <form [formGroup]="formGroup">
      <input type="text" data-color [formControlName]="formControlNames.color" />
      <input type="radio" data-can-fire [formControlName]="formControlNames.canFire" value="true" />
      <input type="radio" data-can-fire [formControlName]="formControlNames.canFire" value="false" />
      <input type="number" data-crew-member-count [formControlName]="formControlNames.crewMemberCount" />
    </form>
  `,
})
class AutomaticRootFormComponent extends NgxAutomaticRootFormComponent<Vehicle> {
  @DataInput()
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('vehicle')
  public dataInput: Required<Vehicle> | null = null;

  // eslint-disable-next-line @angular-eslint/no-output-rename
  @Output('vehicleUpdated')
  public dataOutput: EventEmitter<Vehicle> = new EventEmitter();

  protected getFormControls(): Controls<Vehicle> {
    return {
      color: new UntypedFormControl(null),
      canFire: new UntypedFormControl(null, [Validators.required]),
      crewMemberCount: new UntypedFormControl(null, [
        Validators.min(MIN_CREW_MEMBER_COUNT),
        Validators.max(MAX_CREW_MEMBER_COUNT),
      ]),
    };
  }
}

describe(`NgxAutomaticRootFormComponent`, () => {
  let componentFixture: ComponentFixture<TestWrapperComponent>;
  let componentDebug: DebugElement;
  let component: TestWrapperComponent;
  let componentForm: AutomaticRootFormComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TestWrapperComponent, AutomaticRootFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    componentFixture = TestBed.createComponent(TestWrapperComponent);
    componentDebug = componentFixture.debugElement;
    component = componentFixture.componentInstance;

    componentFixture.detectChanges();

    componentForm = componentDebug.query(By.directive(AutomaticRootFormComponent)).componentInstance;
  });

  xit(`should automatically output the new form as soon as a value changes if the form is valid`, done => {
    const vehicleUpdatedSpy = spyOn(component, 'vehicleUpdated');

    componentForm.formGroup.setValue(getNewCorrectValues());
    // shouldn't require to call `componentForm.manualSave()`!
    componentFixture.detectChanges();

    setTimeout(() => {
      // todo: after upgrading to ng 9 + all the deps the following
      // is typed from chai instead of jasmine and it triggers errors
      // it shouldn't block the new release though
      (expect(vehicleUpdatedSpy) as any).toHaveBeenCalledWith(getNewCorrectValues());
      done();
    }, 0);
  });

  it(`should not output the new form when a value changes until the form is valid`, done => {
    const vehicleUpdatedSpy = spyOn(component, 'vehicleUpdated');

    componentForm.formGroup.setValue(getNewIncorrectValues());
    // shouldn't require to call `componentForm.manualSave()`!
    componentFixture.detectChanges();

    setTimeout(() => {
      // todo: after upgrading to ng 9 + all the deps the following
      // is typed from chai instead of jasmine and it triggers errors
      // it shouldn't block the new release though
      (expect(vehicleUpdatedSpy) as any).not.toHaveBeenCalled();

      componentForm.formGroupControls.crewMemberCount.setValue(MAX_CREW_MEMBER_COUNT);
      // shouldn't require to call `componentForm.manualSave()`!

      setTimeout(() => {
        // todo: after upgrading to ng 9 + all the deps the following
        // is typed from chai instead of jasmine and it triggers errors
        // it shouldn't block the new release though
        (expect(vehicleUpdatedSpy) as any).toHaveBeenCalledWith({
          ...getNewIncorrectValues(),
          crewMemberCount: MAX_CREW_MEMBER_COUNT,
        });
        done();
      }, 0);
    }, 0);
  });
});
