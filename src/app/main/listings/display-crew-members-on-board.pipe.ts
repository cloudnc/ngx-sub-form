import { Pipe, PipeTransform } from '@angular/core';
import { CrewMember } from 'src/app/interfaces/crew-member.interface';

@Pipe({
  name: 'displayCrewMembersOnBoard',
})
export class DisplayCrewMemberOnBoardPipe implements PipeTransform {
  transform(crewMembers: CrewMember[]): string {
    return crewMembers.map(crewMember => `${crewMember.firstName} ${crewMember.lastName}`).join(', ');
  }
}
