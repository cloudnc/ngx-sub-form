import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AssassinDroidComponent } from './assassin-droid.component';

describe('AssassinDroidComponent', () => {
  let component: AssassinDroidComponent;
  let fixture: ComponentFixture<AssassinDroidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssassinDroidComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssassinDroidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
