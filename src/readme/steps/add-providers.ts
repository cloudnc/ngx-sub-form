import { Component } from '@angular/core';
import { subformComponentProviders } from 'ngx-sub-form';

@Component({
  selector: 'app-vehicle-product',
  templateUrl: './vehicle-product.component.html',
  styleUrls: ['./vehicle-product.component.scss'],
  providers: subformComponentProviders(VehicleProductComponent), // <-- Add this
})
export class VehicleProductComponent {}
