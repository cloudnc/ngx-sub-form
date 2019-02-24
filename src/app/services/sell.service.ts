import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OneSell } from '../interfaces/sell.interface';
import { sells } from './sells.data';

@Injectable({
  providedIn: 'root',
})
export class SellService {
  private sells$: BehaviorSubject<OneSell[]> = new BehaviorSubject(sells);

  public getSells(): Observable<OneSell[]> {
    return this.sells$.asObservable();
  }

  public addSell(sell: OneSell): void {
    this.sells$.next([sell, ...this.sells$.getValue()]);
  }
}
