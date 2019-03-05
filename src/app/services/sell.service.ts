import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OneSell } from '../interfaces/sell.interface';
import { hardCodedSells } from './sells.data';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SellService {
  private sells$: BehaviorSubject<OneSell[]> = new BehaviorSubject(hardCodedSells);

  public getSells(): Observable<OneSell[]> {
    return this.sells$.asObservable().pipe(map(this.sellsDeepCopy.bind(this)));
  }

  public upsertSell(sell: OneSell): void {
    const sells = this.sells$.getValue();

    const existingSellIndex: number = sells.findIndex(s => s.id === sell.id);

    if (existingSellIndex > -1) {
      const sellsBefore = sells.slice(0, existingSellIndex);
      const sellAfter = sells.slice(existingSellIndex + 1);
      this.sells$.next([...sellsBefore, sell, ...sellAfter]);
    } else {
      this.sells$.next([sell, ...this.sells$.getValue()]);
    }
  }

  public getOneSell(id: string): Observable<OneSell> {
    return this.sells$.pipe(
      map(sells => sells.find(s => s.id === id)),
      map(this.sellDeepCopy),
    );
  }

  private sellDeepCopy(sell: OneSell): OneSell {
    return JSON.parse(JSON.stringify(sell));
  }

  private sellsDeepCopy(sells: OneSell[]): OneSell[] {
    return sells.map(this.sellDeepCopy);
  }
}
