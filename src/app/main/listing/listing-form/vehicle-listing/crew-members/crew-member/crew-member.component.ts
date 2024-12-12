import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { CrewMember } from '../../../../../../interfaces/crew-member.interface';

@Component({
  selector: 'app-crew-member',
  templateUrl: './crew-member.component.html',
  styleUrls: ['./crew-member.component.scss'],
  providers: subformComponentProviders(CrewMemberComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class CrewMemberComponent {
  public form = createForm<CrewMember>(this, {
    formType: FormType.SUB,
    formControls: {
      firstName: new UntypedFormControl(null, [Validators.required]),
      lastName: new UntypedFormControl(null, [Validators.required]),
    },
  });
}
