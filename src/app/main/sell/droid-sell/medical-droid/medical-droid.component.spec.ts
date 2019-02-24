import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicalDroidComponent } from './medical-droid.component';

describe('MedicalDroidComponent', () => {
  let component: MedicalDroidComponent;
  let fixture: ComponentFixture<MedicalDroidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MedicalDroidComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MedicalDroidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
