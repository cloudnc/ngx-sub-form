import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SellType, OneSell } from 'src/app/interfaces/sell.interface';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
})
export class SellComponent {
  @Output() upsert: EventEmitter<OneSell> = new EventEmitter();

  public SellType = SellType;

  public selectSellType: FormControl = new FormControl();

  public sellForm: FormGroup = new FormGroup({
    sell: new FormControl(null, { validators: [Validators.required] }),
  });

  public upsertSell(sell: OneSell): void {
    this.upsert.emit(sell);
  }
}
