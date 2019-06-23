import { EventEmitter, Input, Component, Output, DebugElement } from '@angular/core';
import { Controls } from './ngx-sub-form-utils';
import { FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { TestBed, async, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DataInput } from './ngx-sub-form.decorators';
import { NgxAutomaticRootFormComponent } from './ngx-automatic-root-form.component';

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
  // tslint:disable-next-line:no-input-rename
  @Input('vehicle')
  public dataInput: Required<Vehicle> | null = null;

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

describe(`NgxAutomaticRootFormComponent`, () => {
  let componentFixture: ComponentFixture<TestWrapperComponent>;
  let componentDebug: DebugElement;
  let component: TestWrapperComponent;
  let componentForm: AutomaticRootFormComponent;

  beforeEach(async(() => {
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

  it(`should automatically output the new form as soon as a value changes if the form is valid`, done => {
    const vehicleUpdatedSpy = spyOn(component, 'vehicleUpdated');

    componentForm.formGroup.setValue(getNewCorrectValues());
    // shouldn't require to call `componentForm.manualSave()`!
    componentFixture.detectChanges();

    setTimeout(() => {
      expect(vehicleUpdatedSpy).toHaveBeenCalledWith(getNewCorrectValues());
      done();
    }, 0);
  });

  it(`should not output the new form when a value changes until the form is valid`, done => {
    const vehicleUpdatedSpy = spyOn(component, 'vehicleUpdated');

    componentForm.formGroup.setValue(getNewIncorrectValues());
    // shouldn't require to call `componentForm.manualSave()`!
    componentFixture.detectChanges();

    setTimeout(() => {
      expect(vehicleUpdatedSpy).not.toHaveBeenCalled();

      componentForm.formGroupControls.crewMemberCount.setValue(MAX_CREW_MEMBER_COUNT);
      // shouldn't require to call `componentForm.manualSave()`!

      setTimeout(() => {
        expect(vehicleUpdatedSpy).toHaveBeenCalledWith({
          ...getNewIncorrectValues(),
          crewMemberCount: MAX_CREW_MEMBER_COUNT,
        });
        done();
      }, 0);
    }, 0);
  });
});
