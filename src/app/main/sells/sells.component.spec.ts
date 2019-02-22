import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SellsComponent } from './sells.component';

describe('SellsComponent', () => {
  let component: SellsComponent;
  let fixture: ComponentFixture<SellsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
