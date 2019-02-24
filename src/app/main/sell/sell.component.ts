import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SellType } from 'src/app/interfaces/sell.interface';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
})
export class SellComponent {
  public SellType = SellType;

  public selectSellType: FormControl = new FormControl();

  public sellForm: FormGroup = new FormGroup({
    sell: new FormControl(null, { validators: [Validators.required] }),
  });
}
