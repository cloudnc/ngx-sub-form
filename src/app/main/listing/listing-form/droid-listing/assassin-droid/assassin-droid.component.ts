import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
import { AssassinDroid, AssassinDroidWeapon, DroidType } from 'src/app/interfaces/droid.interface';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssassinDroidComponent {
  public AssassinDroidWeapon = AssassinDroidWeapon;

  public assassinDroidWeaponText = ASSASSIN_DROID_WEAPON_TEXT;

  public form = createForm<AssassinDroid>(this, {
    formType: FormType.SUB,
    emitDefaultValue: true,
    formControls: {
      color: new UntypedFormControl('#111111', { validators: [Validators.required] }),
      name: new UntypedFormControl('hello', { validators: [Validators.required] }),
      droidType: new UntypedFormControl(DroidType.ASSASSIN, { validators: [Validators.required] }),
      weapons: new UntypedFormControl(['Axe'], { validators: [Validators.required] }),
    },
  });
}
