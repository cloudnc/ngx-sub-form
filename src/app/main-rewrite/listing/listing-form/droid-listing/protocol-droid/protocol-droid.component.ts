import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getObservableLifecycle } from 'ngx-observable-lifecycle';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { DroidType, Languages, ProtocolDroid } from '../../../../../interfaces/droid.interface';

@Component({
  selector: 'app-protocol-droid',
  templateUrl: './protocol-droid.component.html',
  styleUrls: ['./protocol-droid.component.scss'],
  providers: subformComponentProviders(ProtocolDroidComponent),
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      onDestroy: getObservableLifecycle(this).ngOnDestroy,
    },
  });
}
