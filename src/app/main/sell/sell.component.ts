import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SellType, OneSell } from 'src/app/interfaces/sell.interface';
import { SellService } from 'src/app/services/sell.service';
import { ActivatedRoute } from '@angular/router';
import { map, takeUntil, tap, switchMap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-sell',
  templateUrl: './sell.component.html',
  styleUrls: ['./sell.component.scss'],
})
export class SellComponent implements OnInit, OnDestroy {
  public onDestroy$ = new Subject<void>();

  public SellType = SellType;

  public selectSellType: FormControl = new FormControl();

  public sellForm: FormGroup = new FormGroup({
    sell: new FormControl(null, { validators: [Validators.required] }),
  });

  constructor(private route: ActivatedRoute, private sellService: SellService) {}

  public ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(params => params.get('sellId')),
        takeUntil(this.onDestroy$),
        switchMap(sellId => this.sellService.getOneSell(sellId)),
        tap(sell => {
          this.sellForm.get('sell').patchValue(sell);
          this.selectSellType.patchValue(sell.sellType);
        }),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  public upsertSell(sell: OneSell): void {
    this.sellService.addSell(sell);
  }
}
