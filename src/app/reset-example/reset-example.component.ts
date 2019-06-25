import { Component, Output, Input, EventEmitter } from '@angular/core';
import { MainForm } from './interfaces';
import { Controls, NgxRootFormComponent, DataInput } from 'ngx-sub-form';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-reset-example',
  templateUrl: './reset-example.component.html',
  styleUrls: ['./reset-example.component.scss']
})
export class ResetExampleComponent extends NgxRootFormComponent<MainForm> {

  @DataInput()
  // tslint:disable-next-line:no-input-rename
  @Input('resetExample')
  public dataInput: Required<MainForm> | null | undefined;

  // tslint:disable-next-line:no-output-rename
  @Output('resetExampleUpdated')
  public dataOutput: EventEmitter<MainForm> = new EventEmitter();

  protected getFormControls(): Controls<MainForm> {
    return {
      personalDetails: new FormControl(null, { validators: [Validators.required] }),
    };
  }
}
