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
export class SubFormOptionsDirective {
  @Input('ngxSubFormOptions') formControl: FormControl;

  constructor(@Self() private subFormOptionsService: SubFormOptionsService) {}

  // @todo should eventually clean up when directive is being destroyed
  // but this might be an issue, especially when there's 2 level of choices
  // if the form is patched and the main one changes, we don't want the nested ones to
  // delete anything
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
