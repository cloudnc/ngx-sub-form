import { Component, OnInit } from '@angular/core';
import { subformComponentProviders, Controls, NgxSubFormComponent, ControlsNames, getControlsNames } from 'sub-form';
import { DroidSell, SellType } from 'src/app/interfaces/sell.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { UuidService } from 'src/app/services/uuid.service';
import { DroidType } from 'src/app/interfaces/droid.interface';

@Component({
  selector: 'app-droid-sell',
  templateUrl: './droid-sell.component.html',
  styleUrls: ['./droid-sell.component.scss'],
  providers: subformComponentProviders(DroidSellComponent),
})
export class DroidSellComponent extends NgxSubFormComponent implements OnInit {
  private controls: Controls<DroidSell> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    price: new FormControl(null, { validators: [Validators.required] }),
    sellType: new FormControl(SellType.DROID, { validators: [Validators.required] }),
    product: new FormControl(null, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<DroidSell> = getControlsNames(this.controls);

  public selectDroidType: FormControl = new FormControl();

  public DroidType = DroidType;

  constructor(private uuidService: UuidService) {
    super();
  }

  public ngOnInit(): void {
    this.controls.id.disable();
  }
}
