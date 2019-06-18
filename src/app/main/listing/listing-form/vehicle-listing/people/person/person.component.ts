import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Controls, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';
import { Person } from '../../../../../../interfaces/person.interface';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss'],
  providers: subformComponentProviders(PersonComponent),
})
export class PersonComponent extends NgxSubFormComponent<Person> {
  protected getFormControls(): Controls<Person> {
    return {
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
    };
  }
}
