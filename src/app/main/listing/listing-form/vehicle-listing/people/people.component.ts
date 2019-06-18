import { Component } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { Controls, NgxSubFormRemapComponent, subformComponentProviders } from 'ngx-sub-form';
import { Person } from '../../../../../interfaces/person.interface';

interface PeopleForm {
  people: Person[];
}

@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss'],
  providers: subformComponentProviders(PeopleComponent),
})
export class PeopleComponent extends NgxSubFormRemapComponent<Person[], PeopleForm> {
  protected getFormControls(): Controls<PeopleForm> {
    return {
      people: new FormArray([]),
    };
  }

  protected transformToFormGroup(obj: Person[] | null): PeopleForm {
    return {
      people: obj ? obj : [],
    };
  }

  protected transformFromFormGroup(formValue: PeopleForm): Person[] | null {
    return formValue.people;
  }

  public removePerson(index: number): void {
    this.formGroupControls.people.removeAt(index);
  }

  public addPerson(): void {
    this.formGroupControls.people.push(new FormControl());
  }
}
