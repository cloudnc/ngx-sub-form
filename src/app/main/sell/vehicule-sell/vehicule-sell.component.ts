import { Component, OnInit } from '@angular/core';
import { VehiculeSell, SellType } from '../../../interfaces/sell.interface';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { Controls, NgxSubFormComponent, getControlsNames, subformComponentProviders, ControlsNames } from 'sub-form';
import { VehiculeType } from 'src/app/interfaces/vehicule.interface';
import { UuidService } from 'src/app/services/uuid.service';

@Component({
  selector: 'app-vehicule-sell',
  templateUrl: './vehicule-sell.component.html',
  styleUrls: ['./vehicule-sell.component.scss'],
  providers: subformComponentProviders(VehiculeSellComponent),
})
export class VehiculeSellComponent extends NgxSubFormComponent {
  private controls: Controls<VehiculeSell> = {
    id: new FormControl(this.uuidService.generate(), { validators: [Validators.required] }),
    price: new FormControl(null, { validators: [Validators.required] }),
    sellType: new FormControl(SellType.VEHICULE, { validators: [Validators.required] }),
    product: new FormControl(null, { validators: [Validators.required] }),
  };

  protected formGroup: FormGroup = new FormGroup(this.controls);

  public controlsNames: ControlsNames<VehiculeSell> = getControlsNames(this.controls);

  public selectVehiculeType: FormControl = new FormControl();

  public VehiculeType = VehiculeType;

  constructor(private uuidService: UuidService) {
    super();

    this.controls.id.disable();
  }

  public writeValue(vehiculeSell: VehiculeSell) {
    super.writeValue(vehiculeSell);

    if (!!vehiculeSell) {
      this.selectVehiculeType.setValue(vehiculeSell.product.vehiculeType);
    }
  }
}
