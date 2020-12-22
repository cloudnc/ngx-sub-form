import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { createForm, FormType, subformComponentProviders } from 'ngx-sub-form';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DroidProductComponent {
  public DroidType = DroidType;

  public form = createForm<OneDroid, OneDroidForm>(this, {
    formType: FormType.SUB,
    formControls: {
      protocolDroid: new FormControl(null),
      medicalDroid: new FormControl(null),
      astromechDroid: new FormControl(null),
      assassinDroid: new FormControl(null),
      droidType: new FormControl(null, { validators: [Validators.required] }),
    },
    toFormGroup: (obj: OneDroid): OneDroidForm => {
      return {
        protocolDroid: obj.droidType === DroidType.PROTOCOL ? obj : null,
        medicalDroid: obj.droidType === DroidType.MEDICAL ? obj : null,
        astromechDroid: obj.droidType === DroidType.ASTROMECH ? obj : null,
        assassinDroid: obj.droidType === DroidType.ASSASSIN ? obj : null,
        droidType: obj.droidType,
      };
    },
    fromFormGroup: (formValue: OneDroidForm): OneDroid => {
      switch (formValue.droidType) {
        case DroidType.PROTOCOL:
          return formValue.protocolDroid as any; // todo
        case DroidType.MEDICAL:
          return formValue.medicalDroid as any; // todo
        case DroidType.ASTROMECH:
          return formValue.astromechDroid as any; // todo
        case DroidType.ASSASSIN:
          return formValue.assassinDroid as any; // todo
        case null:
          return null as any; // todo
        default:
          throw new UnreachableCase(formValue.droidType);
      }
    },
  });
}
