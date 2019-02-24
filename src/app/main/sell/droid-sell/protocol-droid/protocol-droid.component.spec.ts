import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProtocolDroidComponent } from './protocol-droid.component';

describe('ProtocolDroidComponent', () => {
  let component: ProtocolDroidComponent;
  let fixture: ComponentFixture<ProtocolDroidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProtocolDroidComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProtocolDroidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
