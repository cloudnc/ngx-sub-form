import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { OneSell } from '../interfaces/sell.interface';
import { sells } from './sells.data';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class SellService {
  private sells$: BehaviorSubject<OneSell[]> = new BehaviorSubject(sells);

  public getSells(): Observable<OneSell[]> {
    return this.sells$.asObservable().pipe(map(this.sellsDeepCopy.bind(this)));
  }

  public addSell(sell: OneSell): void {
    this.sells$.next([sell, ...this.sells$.getValue()]);
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
