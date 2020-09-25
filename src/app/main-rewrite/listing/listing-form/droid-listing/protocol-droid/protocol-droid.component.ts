import { Component, forwardRef } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { createForm, FormType, NgxSubForm, subformComponentProviders } from 'ngx-sub-form/new';
import { DroidType, Languages, ProtocolDroid } from '../../../../../interfaces/droid.interface';

@NgxSubForm()
@Component({
  selector: 'app-protocol-droid',
  templateUrl: './protocol-droid.component.html',
  styleUrls: ['./protocol-droid.component.scss'],
  providers: subformComponentProviders(forwardRef(() => ProtocolDroidComponent)),
})
export class ProtocolDroidComponent {
  public Languages = Languages;

  public form = createForm<ProtocolDroid>(this, {
    formType: FormType.SUB,
    formControls: {
      color: new FormControl(null, { validators: [Validators.required] }),
      name: new FormControl(null, { validators: [Validators.required] }),
      droidType: new FormControl(DroidType.PROTOCOL, { validators: [Validators.required] }),
      spokenLanguages: new FormControl(null, { validators: [Validators.required] }),
    },
    componentHooks: {
      onDestroy: getObservableLifecycle(this).onDestroy,
    },
  });
}
