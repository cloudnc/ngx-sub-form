import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { CrewMember } from '../../../../../interfaces/crew-member.interface';

interface CrewMembersForm {
  crewMembers: CrewMember[];
}

@Component({
  selector: 'app-crew-members',
  templateUrl: './crew-members.component.html',
  styleUrls: ['./crew-members.component.scss'],
  providers: subformComponentProviders(CrewMembersComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CrewMembersComponent {
  public form = createForm<CrewMember[], CrewMembersForm>(this, {
    formType: FormType.SUB,
    formControls: {
      crewMembers: new UntypedFormArray([], {
        validators: formControl => (formControl.value.length >= 2 ? null : { minimumCrewMemberCount: 2 }),
      }),
    },
    toFormGroup: (obj: CrewMember[]): CrewMembersForm => {
      return {
        crewMembers: !obj ? [] : obj,
      };
    },
    fromFormGroup: (formValue: CrewMembersForm): CrewMember[] => {
      return formValue.crewMembers;
    },
    createFormArrayControl: (key, value) => {
      switch (key) {
        case 'crewMembers':
          return new UntypedFormControl(value, [Validators.required]);
        default:
          return new UntypedFormControl(value);
      }
    },
  });

  public removeCrewMember(index: number): void {
    this.form.formGroup.controls.crewMembers.removeAt(index);
  }

  public addCrewMember(): void {
    this.form.formGroup.controls.crewMembers.push(
      this.form.createFormArrayControl('crewMembers', {
        firstName: '',
        lastName: '',
      }),
    );
  }
}
