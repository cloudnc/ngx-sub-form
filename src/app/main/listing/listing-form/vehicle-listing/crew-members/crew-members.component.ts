import { Component } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Controls, NgxSubFormRemapComponent, subformComponentProviders } from 'ngx-sub-form';
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
export class CrewMembersComponent extends NgxSubFormRemapComponent<CrewMember[], CrewMembersForm> {
  protected getFormControls(): Controls<CrewMembersForm> {
    return {
      crewMembers: new FormArray([]),
    };
  }

  protected transformToFormGroup(obj: CrewMember[] | null): CrewMembersForm {
    return {
      crewMembers: obj ? obj : [],
    };
  }

  protected transformFromFormGroup(formValue: CrewMembersForm): CrewMember[] | null {
    return formValue.crewMembers;
  }

  public removeCrewMember(index: number): void {
    this.formGroupControls.crewMembers.removeAt(index);
  }

  public addCrewMember(): void {
    this.formGroupControls.crewMembers.push(new FormControl());
  }
}
