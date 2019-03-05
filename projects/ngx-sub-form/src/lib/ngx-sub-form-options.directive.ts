import { Directive, Injectable, Self, OnInit, Inject, Optional, Input } from '@angular/core';
import { NgxSubFormComponent } from './ngx-sub-form.component';
import { FormControl } from '@angular/forms';
import { SUB_FORM_COMPONENT_TOKEN } from './ngx-sub-form-tokens';

@Injectable()
export class NgxSubFormOptionsService {
  public register(ngxSubFormComponent: NgxSubFormComponent): void {
    ngxSubFormComponent.resetValueOnDestroy = false;
  }
}

@Directive({
  selector: '[ngxSubFormOptions]',
  providers: [NgxSubFormOptionsService],
})
export class SubFormOptionsDirective {
  constructor() {}

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
    private ngxSubFormOptionsService: NgxSubFormOptionsService,
    @Inject(SUB_FORM_COMPONENT_TOKEN) @Self() @Optional() private component: NgxSubFormComponent,
  ) {}

  public ngOnInit(): void {
    this.ngxSubFormOptionsService.register(this.component);
  }
}
