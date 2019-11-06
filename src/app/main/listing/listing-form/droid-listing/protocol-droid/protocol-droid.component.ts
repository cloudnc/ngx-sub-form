import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
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
      color: new FormControl(null, { validators: [Validators.required] }),
      name: new FormControl(null, { validators: [Validators.required] }),
      droidType: new FormControl(null, { validators: [Validators.required] }),
      spokenLanguages: new FormControl(null, { validators: [Validators.required] }),
    };
  }

  public getDefaultValues(): Partial<ProtocolDroid> | undefined {
    return {
      droidType: DroidType.PROTOCOL,
    };
  }
}
