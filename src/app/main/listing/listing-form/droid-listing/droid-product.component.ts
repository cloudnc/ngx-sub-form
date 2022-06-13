import { Component } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormRemapComponent, subformComponentProviders } from 'ngx-sub-form';
import {
  AssassinDroid,
  AstromechDroid,
  DroidType,
  MedicalDroid,
  OneDroid,
  ProtocolDroid,
} from 'src/app/interfaces/droid.interface';
import { UnreachableCase } from '../../../../shared/utils';

interface OneDroidForm {
  protocolDroid: ProtocolDroid | null;
  medicalDroid: MedicalDroid | null;
  astromechDroid: AstromechDroid | null;
  assassinDroid: AssassinDroid | null;
  droidType: DroidType | null;
}

@Component({
  selector: 'app-droid-product',
  templateUrl: './droid-product.component.html',
  styleUrls: ['./droid-product.component.scss'],
  providers: subformComponentProviders(DroidProductComponent),
})
export class DroidProductComponent extends NgxSubFormRemapComponent<OneDroid, OneDroidForm> {
  public DroidType = DroidType;

  protected getFormControls(): Controls<OneDroidForm> {
    return {
      protocolDroid: new UntypedFormControl(null),
      medicalDroid: new UntypedFormControl(null),
      astromechDroid: new UntypedFormControl(null),
      assassinDroid: new UntypedFormControl(null),
      droidType: new UntypedFormControl(null, { validators: [Validators.required] }),
    };
  }

  protected transformToFormGroup(obj: OneDroid | null): OneDroidForm | null {
    if (!obj) {
      return null;
    }

    return {
      protocolDroid: obj.droidType === DroidType.PROTOCOL ? obj : null,
      medicalDroid: obj.droidType === DroidType.MEDICAL ? obj : null,
      astromechDroid: obj.droidType === DroidType.ASTROMECH ? obj : null,
      assassinDroid: obj.droidType === DroidType.ASSASSIN ? obj : null,
      droidType: obj.droidType,
    };
  }

  protected transformFromFormGroup(formValue: OneDroidForm): OneDroid | null {
    switch (formValue.droidType) {
      case DroidType.PROTOCOL:
        return formValue.protocolDroid;
      case DroidType.MEDICAL:
        return formValue.medicalDroid;
      case DroidType.ASTROMECH:
        return formValue.astromechDroid;
      case DroidType.ASSASSIN:
        return formValue.assassinDroid;
      case null:
        return null;
      default:
        throw new UnreachableCase(formValue.droidType);
    }
  }
}
