import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DroidSellComponent } from './droid-sell.component';

describe('DroidSellComponent', () => {
  let component: DroidSellComponent;
  let fixture: ComponentFixture<DroidSellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DroidSellComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DroidSellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
