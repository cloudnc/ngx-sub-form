import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AbstractControl, FormArray, FormControl, Validators } from '@angular/forms';
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
})
export class CrewMembersComponent {
  public form = createForm<CrewMember[], CrewMembersForm>(this, {
    formType: FormType.SUB,
    formControls: {
      crewMembers: new FormArray(
        [],
        // the following validator is here to make sure we have a proper fix to
        // https://github.com/cloudnc/ngx-sub-form/issues/161
        this.minLengthArray(3),
      ),
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
          return new FormControl(value, [Validators.required]);
        default:
          return new FormControl(value);
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

  private minLengthArray(minimumLength: number) {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value.length >= minimumLength) {
        return null;
      }

      return {
        minLengthArray: {
          currentLength: c.value.length,
          minimumLength,
        },
      };
    };
  }
}
