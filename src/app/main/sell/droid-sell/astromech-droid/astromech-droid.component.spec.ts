import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AstromechDroidComponent } from './astromech-droid.component';

describe('AstromechDroidComponent', () => {
  let component: AstromechDroidComponent;
  let fixture: ComponentFixture<AstromechDroidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AstromechDroidComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AstromechDroidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
