import { Directive, OnDestroy, Injectable, Self, OnInit, InjectionToken, Inject, Optional, Input } from '@angular/core';
import { NgxSubFormComponent } from './ngx-sub-form.component';
import { FormControl } from '@angular/forms';
import { SUB_FORM_COMPONENT_TOKEN } from './ngx-sub-form-tokens';

@Injectable()
export class SubFormOptionsService {
  public register(subFormComponent: NgxSubFormComponent): void {
    subFormComponent.resetValueOnDestroy = false;
  }
}

@Directive({
  selector: '[ngxSubFormOptions]',
  providers: [SubFormOptionsService],
})
export class SubFormOptionsDirective implements OnDestroy {
  @Input('ngxSubFormOptions') formControl: FormControl;

  constructor(@Self() private subFormOptionsService: SubFormOptionsService) {}

  public ngOnDestroy(): void {
    this.formControl.setValue(null);
  }
}

@Directive({
  selector: '[ngxSubFormOption]',
})
export class SubFormOptionDirective implements OnInit {
  constructor(
    private subFormOptionsService: SubFormOptionsService,
    @Inject(SUB_FORM_COMPONENT_TOKEN) @Self() @Optional() private component: NgxSubFormComponent,
  ) {}

  public ngOnInit(): void {
    this.subFormOptionsService.register(this.component);
  }
}
