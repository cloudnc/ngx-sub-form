import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { AstromechDroid, AstromechDroidShape, DroidType } from '../../../../../interfaces/droid.interface';

@Component({
  selector: 'app-astromech-droid',
  templateUrl: './astromech-droid.component.html',
  styleUrls: ['./astromech-droid.component.scss'],
  providers: subformComponentProviders(AstromechDroidComponent),
})
export class AstromechDroidComponent extends NgxSubFormComponent<AstromechDroid> {
  public AstromechDroidShape = AstromechDroidShape;

  protected getFormControls(): Controls<AstromechDroid> {
    return {
      color: new FormControl(null, { validators: [Validators.required] }),
      name: new FormControl(null, { validators: [Validators.required] }),
      droidType: new FormControl(null, { validators: [Validators.required] }),
      toolCount: new FormControl(null, { validators: [Validators.required] }),
      shape: new FormControl(null, { validators: [Validators.required] }),
    };
  }

  public getDefaultValues(): Partial<AstromechDroid> | null {
    return {
      droidType: DroidType.ASTROMECH,
    };
  }
}
