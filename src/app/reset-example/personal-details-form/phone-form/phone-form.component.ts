import { Component } from '@angular/core';
import { NgxSubFormComponent, Controls, subformComponentProviders } from 'ngx-sub-form';
import { FormControl, Validators } from '@angular/forms';
import { Phone } from '../../interfaces';

@Component({
  selector: 'app-phone-form',
  templateUrl: './phone-form.component.html',
  styleUrls: ['./phone-form.component.scss'],
  providers: subformComponentProviders(PhoneFormComponent)
})
export class PhoneFormComponent extends NgxSubFormComponent<Phone> {
  protected getFormControls(): Controls<Phone> {
    return {
      phone: new FormControl(null, { validators: [Validators.required] }),
      countrycode: new FormControl(null, { validators: [Validators.required] }),
    };
  }
}
