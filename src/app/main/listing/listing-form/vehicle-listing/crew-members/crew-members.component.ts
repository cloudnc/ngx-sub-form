import { Component } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, Validators } from '@angular/forms';
import {
  Controls,
  NgxSubFormRemapComponent,
  subformComponentProviders,
  ArrayPropertyKey,
  ArrayPropertyValue,
  NgxFormWithArrayControls,
} from 'ngx-sub-form';
import { CrewMember } from '../../../../../interfaces/crew-member.interface';

interface CrewMembersForm {
  crewMembers: CrewMember[];
}

@Component({
  selector: 'app-crew-members',
  templateUrl: './crew-members.component.html',
  styleUrls: ['./crew-members.component.scss'],
  providers: subformComponentProviders(CrewMembersComponent),
})
export class CrewMembersComponent extends NgxSubFormRemapComponent<CrewMember[], CrewMembersForm>
  implements NgxFormWithArrayControls<CrewMembersForm> {
  protected getFormControls(): Controls<CrewMembersForm> {
    return {
      crewMembers: new UntypedFormArray([], {
        validators: formControl => (formControl.value.length >= 2 ? null : { minimumCrewMemberCount: 2 }),
      }),
    };
  }

  public getDefaultValues(): Partial<CrewMembersForm> | null {
    return {
      crewMembers: [],
    };
  }

  protected transformToFormGroup(obj: CrewMember[] | null): CrewMembersForm | null {
    return {
      crewMembers: !obj ? [] : obj,
    };
  }

  protected transformFromFormGroup(formValue: CrewMembersForm): CrewMember[] | null {
    return formValue.crewMembers;
  }

  public removeCrewMember(index: number): void {
    this.formGroupControls.crewMembers.removeAt(index);
  }

  public addCrewMember(): void {
    this.formGroupControls.crewMembers.push(
      this.createFormArrayControl('crewMembers', {
        firstName: '',
        lastName: '',
      }),
    );
  }

  // following method is not required and return by default a simple FormControl
  // if needed, you can use the `createFormArrayControl` hook to customize the creation
  // of your `FormControl`s that will be added to the `FormArray`
  public createFormArrayControl(
    key: ArrayPropertyKey<CrewMembersForm> | undefined,
    value: ArrayPropertyValue<CrewMembersForm>,
  ): UntypedFormControl {
    switch (key) {
      // note: the following string is type safe based on your form properties!
      case 'crewMembers':
        return new UntypedFormControl(value, [Validators.required]);
      default:
        return new UntypedFormControl(value);
    }
  }
}
