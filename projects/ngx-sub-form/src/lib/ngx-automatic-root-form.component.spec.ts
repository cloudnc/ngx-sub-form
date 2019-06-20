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
  numberOfCrewMembersOnBoard: number | null;
}

const MIN_NUMBER_OF_CREW_MEMBERS_ON_BOARD = 5;
const MAX_NUMBER_OF_CREW_MEMBERS_ON_BOARD = 15;

const getDefaultValues = (): Required<Vehicle> => ({
  color: '#ffffff',
  canFire: true,
  numberOfCrewMembersOnBoard: 10,
});

const getNewCorrectValues = (): Required<Vehicle> => ({
  color: '#000000',
  canFire: false,
  numberOfCrewMembersOnBoard: 15,
});

const getNewIncorrectValues = (): Required<Vehicle> => ({
  color: '#000000',
  canFire: false,
  numberOfCrewMembersOnBoard: MAX_NUMBER_OF_CREW_MEMBERS_ON_BOARD + 1,
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
      <input type="number" data-number-of-crew-members-on-board [formControlName]="formControlNames.numberOfCrewMembersOnBoard" />
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
      numberOfCrewMembersOnBoard: new FormControl(null, [
        Validators.min(MIN_NUMBER_OF_CREW_MEMBERS_ON_BOARD),
        Validators.max(MAX_NUMBER_OF_CREW_MEMBERS_ON_BOARD),
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

      componentForm.formGroupControls.numberOfCrewMembersOnBoard.setValue(MAX_NUMBER_OF_CREW_MEMBERS_ON_BOARD);
      // shouldn't require to call `componentForm.manualSave()`!

      setTimeout(() => {
        expect(vehicleUpdatedSpy).toHaveBeenCalledWith({
          ...getNewIncorrectValues(),
          numberOfCrewMembersOnBoard: MAX_NUMBER_OF_CREW_MEMBERS_ON_BOARD,
        });
        done();
      }, 0);
    }, 0);
  });
});
