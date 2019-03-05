import { Component, OnInit } from '@angular/core';
import { DroidType, MedicalDroid } from 'src/app/interfaces/droid.interface';
import { NgxSubFormComponent, subformComponentProviders, Controls, ControlsNames, getControlsNames } from 'sub-form';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from 'src/app/services/uuid.service';

@Component({
  selector: 'app-medical-droid',
  templateUrl: './medical-droid.component.html',
  styleUrls: ['./medical-droid.component.scss'],
  providers: subformComponentProviders(MedicalDroidComponent),
})
export class MedicalDroidComponent extends NgxSubFormComponent implements OnInit {
  private controls: Controls<MedicalDroid> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    color: new FormControl(null, { validators: [Validators.required] }),
    name: new FormControl(null, { validators: [Validators.required] }),
    droidType: new FormControl(DroidType.MEDICAL, { validators: [Validators.required] }),
    canHealHumans: new FormControl(false, { validators: [Validators.required] }),
    canFixRobots: new FormControl(false, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<MedicalDroid> = getControlsNames(this.controls);

  constructor(private uuidService: UuidService) {
    super();
  }

  public ngOnInit(): void {
    this.controls.id.disable();
  }
}
