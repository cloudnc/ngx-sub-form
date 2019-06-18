import { Pipe, PipeTransform } from '@angular/core';
import { Person } from 'src/app/interfaces/person.interface';

@Pipe({
  name: 'displayPeopleOnBoard',
})
export class DisplayPeopleOnBoardPipe implements PipeTransform {
  transform(peopleOnBoard: Person[]): string {
    return peopleOnBoard.map(person => `${person.firstName} ${person.lastName}`).join(', ');
  }
}
