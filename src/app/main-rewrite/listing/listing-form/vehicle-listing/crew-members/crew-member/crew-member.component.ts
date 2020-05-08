import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { getObservableLifecycle, ObservableLifecycle } from 'ngx-observable-lifecycle';
import { subformComponentProviders } from 'ngx-sub-form';
import { createForm } from '../../../../../../../../projects/ngx-sub-form/src/lib/new/ngx-sub-form';
import { FormType } from '../../../../../../../../projects/ngx-sub-form/src/lib/new/ngx-sub-form.types';
import { CrewMember } from '../../../../../../interfaces/crew-member.interface';

@ObservableLifecycle()
@Component({
  selector: 'app-crew-member',
  templateUrl: './crew-member.component.html',
  styleUrls: ['./crew-member.component.scss'],
  providers: subformComponentProviders(CrewMemberComponent),
})
export class CrewMemberComponent {
  public form = createForm<CrewMember>(this, {
    formType: FormType.SUB,
    formControls: {
      firstName: new FormControl(null, [Validators.required]),
      lastName: new FormControl(null, [Validators.required]),
    },
    componentHooks: {
      onDestroy: getObservableLifecycle(this).onDestroy,
    },
  });
}
