import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetExampleComponent } from './reset-example.component';

describe('ResetExampleComponent', () => {
  let component: ResetExampleComponent;
  let fixture: ComponentFixture<ResetExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetExampleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
