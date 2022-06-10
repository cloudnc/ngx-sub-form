import { Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { DroidType, Languages, ProtocolDroid } from '../../../../../interfaces/droid.interface';

@Component({
  selector: 'app-protocol-droid',
  templateUrl: './protocol-droid.component.html',
  styleUrls: ['./protocol-droid.component.scss'],
  providers: subformComponentProviders(ProtocolDroidComponent),
})
export class ProtocolDroidComponent extends NgxSubFormComponent<ProtocolDroid> {
  public Languages = Languages;

  protected getFormControls(): Controls<ProtocolDroid> {
    return {
      color: new UntypedFormControl(null, { validators: [Validators.required] }),
      name: new UntypedFormControl(null, { validators: [Validators.required] }),
      droidType: new UntypedFormControl(null, { validators: [Validators.required] }),
      spokenLanguages: new UntypedFormControl(null, { validators: [Validators.required] }),
    };
  }

  public getDefaultValues(): Partial<ProtocolDroid> | null {
    return {
      droidType: DroidType.PROTOCOL,
    };
  }
}
