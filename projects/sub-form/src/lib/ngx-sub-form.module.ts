import { NgModule } from '@angular/core';
import { SubFormOptionsDirective, SubFormOptionDirective } from './ngx-sub-form-options.directive';

@NgModule({
  declarations: [SubFormOptionsDirective, SubFormOptionDirective],
  exports: [SubFormOptionsDirective, SubFormOptionDirective],
})
export class NgxSubFormModule {}
