import { Component, OnInit } from '@angular/core';
import { subformComponentProviders, SubFormComponent, Controls, ControlsNames, getControlsNames } from 'sub-form';
import { ProtocolDroid, DroidType, Languages } from '../../../../interfaces/droid.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from '../../../../services/uuid.service';

@Component({
  selector: 'app-protocol-droid',
  templateUrl: './protocol-droid.component.html',
  styleUrls: ['./protocol-droid.component.scss'],
  providers: subformComponentProviders(ProtocolDroidComponent),
})
export class ProtocolDroidComponent extends SubFormComponent {
  private controls: Controls<ProtocolDroid> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    color: new FormControl(null, { validators: [Validators.required] }),
    name: new FormControl(null, { validators: [Validators.required] }),
    droidType: new FormControl(DroidType.PROTOCOL, { validators: [Validators.required] }),
    spokenLanguages: new FormControl(null, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<ProtocolDroid> = getControlsNames(this.controls);

  public Languages = Languages;

  constructor(private uuidService: UuidService) {
    super();
  }

  ngOnInit() {}
}
