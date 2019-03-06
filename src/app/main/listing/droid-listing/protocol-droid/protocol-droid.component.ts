import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { DroidType, Languages, ProtocolDroid } from '../../../../interfaces/droid.interface';

@Component({
  selector: 'app-protocol-droid',
  templateUrl: './protocol-droid.component.html',
  styleUrls: ['./protocol-droid.component.scss'],
  providers: subformComponentProviders(ProtocolDroidComponent),
})
export class ProtocolDroidComponent extends NgxSubFormComponent<ProtocolDroid> {
  protected formControls: Controls<ProtocolDroid> = {
    color: new FormControl(null, { validators: [Validators.required] }),
    name: new FormControl(null, { validators: [Validators.required] }),
    droidType: new FormControl(DroidType.PROTOCOL, { validators: [Validators.required] }),
    spokenLanguages: new FormControl(null, { validators: [Validators.required] }),
  };

  public Languages = Languages;

}
