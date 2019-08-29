import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { FormGroupOptions, NgxSubFormComponent, subformComponentProviders } from 'ngx-sub-form';

interface PasswordForm {
  password: string;
  passwordRepeat: string;
}

@Component({
  selector: 'app-password-sub-form',
  templateUrl: './password-sub-form.component.html',
  styleUrls: ['./password-sub-form.component.scss'],
  providers: subformComponentProviders(PasswordSubFormComponent),
})
class PasswordSubFormComponent extends NgxSubFormComponent<PasswordForm> {
  protected getFormControls() {
    return {
      password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
      passwordRepeat: new FormControl(null, Validators.required),
    };
  }

  protected getFormGroupControlOptions(): FormGroupOptions<PasswordForm> {
    return {
      validators: [
        formGroup => {
          if (formGroup.value.password !== formGroup.value.passwordRepeat) {
            return {
              passwordsMustMatch: true,
            };
          }

          return null;
        },
      ],
    };
  }
}
