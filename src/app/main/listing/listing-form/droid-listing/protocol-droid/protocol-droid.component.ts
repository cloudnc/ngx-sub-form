import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { DroidType, Languages, ProtocolDroid } from '../../../../../interfaces/droid.interface';

@Component({
  selector: 'app-protocol-droid',
  templateUrl: './protocol-droid.component.html',
  styleUrls: ['./protocol-droid.component.scss'],
  providers: subformComponentProviders(ProtocolDroidComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ProtocolDroidComponent {
  public Languages = Languages;

  public form = createForm<ProtocolDroid>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new UntypedFormControl(null, { validators: [Validators.required] }),
      name: new UntypedFormControl(null, { validators: [Validators.required] }),
      droidType: new UntypedFormControl(DroidType.PROTOCOL, { validators: [Validators.required] }),
      spokenLanguages: new UntypedFormControl(null, { validators: [Validators.required] }),
    },
  });
}
