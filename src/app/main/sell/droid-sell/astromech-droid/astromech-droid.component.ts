import { Component } from '@angular/core';
import { UuidService } from '../../../../services/uuid.service';
import {
  subformComponentProviders,
  NgxSubFormComponent,
  Controls,
  ControlsNames,
  getControlsNames,
} from 'ngx-sub-form';
import { AstromechDroid, DroidType, AstromechDroidShape } from '../../../../interfaces/droid.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-astromech-droid',
  templateUrl: './astromech-droid.component.html',
  styleUrls: ['./astromech-droid.component.scss'],
  providers: subformComponentProviders(AstromechDroidComponent),
})
export class AstromechDroidComponent extends NgxSubFormComponent {
  private controls: Controls<AstromechDroid> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    color: new FormControl(null, { validators: [Validators.required] }),
    name: new FormControl(null, { validators: [Validators.required] }),
    droidType: new FormControl(DroidType.ASTROMECH, { validators: [Validators.required] }),
    numberOfToolsCarried: new FormControl(null, { validators: [Validators.required] }),
    shape: new FormControl(null, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<AstromechDroid> = getControlsNames(this.controls);

  public AstromechDroidShape = AstromechDroidShape;

  constructor(private uuidService: UuidService) {
    super();
  }
}
