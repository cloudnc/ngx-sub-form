import { Component } from '@angular/core';
import { NgxSubFormComponent, Controls, subformComponentProviders } from 'ngx-sub-form';
import { FormControl, Validators } from '@angular/forms';
import { Name } from '../../interfaces';

@Component({
  selector: 'app-name-form',
  templateUrl: './name-form.component.html',
  styleUrls: ['./name-form.component.scss'],
  providers: subformComponentProviders(NameFormComponent)
})
export class NameFormComponent extends NgxSubFormComponent<Name> {
  protected getFormControls(): Controls<Name> {
    return {
      firstname: new FormControl(null, { validators: [Validators.required] }),
      lastname: new FormControl(null, { validators: [Validators.required] }),
    };
  }
}
