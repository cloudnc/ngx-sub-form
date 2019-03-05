import { Component } from '@angular/core';
import {
  Controls,
  subformComponentProviders,
  NgxSubFormComponent,
  ControlsNames,
  getControlsNames,
} from 'ngx-sub-form';
import { AssassinDroid, DroidType, AssassinDroidWeapon } from 'src/app/interfaces/droid.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from 'src/app/services/uuid.service';

export const ASSASSIN_DROID_WEAPON_TEXT: { [K in AssassinDroidWeapon]: string } = {
  [AssassinDroidWeapon.SABER]: 'Saber',
  [AssassinDroidWeapon.FLAME_THROWER]: 'Flame thrower',
  [AssassinDroidWeapon.GUN]: 'Gun',
  [AssassinDroidWeapon.AXE]: 'Axe',
};

@Component({
  selector: 'app-assassin-droid',
  templateUrl: './assassin-droid.component.html',
  styleUrls: ['./assassin-droid.component.scss'],
  providers: subformComponentProviders(AssassinDroidComponent),
})
export class AssassinDroidComponent extends NgxSubFormComponent {
  private controls: Controls<AssassinDroid> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    color: new FormControl(null, { validators: [Validators.required] }),
    name: new FormControl(null, { validators: [Validators.required] }),
    droidType: new FormControl(DroidType.ASSASSIN, { validators: [Validators.required] }),
    weapons: new FormControl([], { validators: [Validators.required] }),
  };

  public formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<AssassinDroid> = getControlsNames(this.controls);

  public AssassinDroidWeapon = AssassinDroidWeapon;

  public assassinDroidWeaponText = ASSASSIN_DROID_WEAPON_TEXT;

  constructor(private uuidService: UuidService) {
    super();
  }
}
