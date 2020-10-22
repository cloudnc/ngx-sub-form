import { Component, forwardRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { createForm, FormType, NgxSubForm, subformComponentProviders } from 'ngx-sub-form/new';
import { CrewMember } from '../../../../../../interfaces/crew-member.interface';

@Component({
  selector: 'app-crew-member',
  templateUrl: './crew-member.component.html',
  styleUrls: ['./crew-member.component.scss'],
  providers: subformComponentProviders(forwardRef(() => CrewMemberComponent)),
})
export class CrewMemberComponent {
  public form = createForm<CrewMember>(this, {
    formType: FormType.SUB,
    formControls: {
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
    },
  });
}
