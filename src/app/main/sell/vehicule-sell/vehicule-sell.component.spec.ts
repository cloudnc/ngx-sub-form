import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeSellComponent } from './vehicule-sell.component';

describe('VehiculeSellComponent', () => {
  let component: VehiculeSellComponent;
  let fixture: ComponentFixture<VehiculeSellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VehiculeSellComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiculeSellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
