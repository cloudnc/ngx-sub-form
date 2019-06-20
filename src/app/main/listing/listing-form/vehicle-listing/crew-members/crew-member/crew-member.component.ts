import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { CrewMember } from '../../../../../../interfaces/crew-member.interface';

@Component({
  selector: 'app-crew-member',
  templateUrl: './crew-member.component.html',
  styleUrls: ['./crew-member.component.scss'],
  providers: subformComponentProviders(CrewMemberComponent),
})
export class CrewMemberComponent extends NgxSubFormComponent<CrewMember> {
  protected getFormControls(): Controls<CrewMember> {
    return {
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
    };
  }
}
