import { Component, OnInit } from '@angular/core';
import { NgxSubFormComponent, Controls, subformComponentProviders } from 'ngx-sub-form';
import { FormControl, Validators } from '@angular/forms';
import { PersonalDetails, Gender } from '../interfaces';

@Component({
  selector: 'app-personal-details-form',
  templateUrl: './personal-details-form.component.html',
  styleUrls: ['./personal-details-form.component.scss'],
  providers: subformComponentProviders(PersonalDetailsFormComponent)
})
export class PersonalDetailsFormComponent extends NgxSubFormComponent<PersonalDetails> {
  public Gender: typeof Gender = Gender;

  protected getFormControls(): Controls<PersonalDetails> {
    return {
      name: new FormControl(null, { validators: [Validators.required] }),
      gender: new FormControl(null, { validators: [Validators.required] }),
      address: new FormControl(null, { validators: [Validators.required] }),
      phone: new FormControl(null, { validators: [Validators.required] }),
    };
  }
}
