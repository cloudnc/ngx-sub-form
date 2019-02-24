import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SpaceshipComponent } from './spaceship.component';

describe('SpaceshipComponent', () => {
  let component: SpaceshipComponent;
  let fixture: ComponentFixture<SpaceshipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SpaceshipComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SpaceshipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
