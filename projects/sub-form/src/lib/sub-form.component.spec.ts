import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubFormComponent } from './sub-form.component';

describe('SubFormComponent', () => {
  let component: SubFormComponent;
  let fixture: ComponentFixture<SubFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubFormComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
