import { Component, Input } from '@angular/core';
import { OneSell, SellType } from '../../interfaces/sell.interface';
import { DroidType } from 'src/app/interfaces/droid.interface';
import { VehiculeType } from 'src/app/interfaces/vehicule.interface';

@Component({
  selector: 'app-sells',
  templateUrl: './sells.component.html',
  styleUrls: ['./sells.component.scss'],
})
export class SellsComponent {
  @Input() sells: OneSell[];

  public SellType = SellType;

  public DroidType = DroidType;

  public VehiculeType = VehiculeType;
}
