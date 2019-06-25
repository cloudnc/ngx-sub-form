import { Component } from '@angular/core';
import { NgxSubFormComponent, Controls, subformComponentProviders } from 'ngx-sub-form';
import { FormControl, Validators } from '@angular/forms';
import { Address } from '../../interfaces';

@Component({
  selector: 'app-address-form',
  templateUrl: './address-form.component.html',
  styleUrls: ['./address-form.component.scss'],
  providers: subformComponentProviders(AddressFormComponent)
})
export class AddressFormComponent extends NgxSubFormComponent<Address> {
  protected getFormControls(): Controls<Address> {
    return {
      streetaddress: new FormControl(null, { validators: [Validators.required] }),
      city: new FormControl(null, { validators: [Validators.required] }),
      state: new FormControl(null, { validators: [Validators.required] }),
      zip: new FormControl(null, { validators: [Validators.required] }),
      country: new FormControl(null, { validators: [Validators.required] }),
    };
  }
}
