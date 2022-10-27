import { registerLocaleData } from '@angular/common';
import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import localeDe from '@angular/common/locales/de';

registerLocaleData(localeDe, 'de');

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      [
        {
          path: 'rewrite',
          loadChildren: () => import('./main-rewrite/main.module').then(x => x.MainModule),
        },
        {
          path: '',
          loadChildren: () => import('./main/main.module').then(x => x.MainModule),
        },
      ],
      { relativeLinkResolution: 'legacy' },
    ),
    SharedModule,
  ],
  providers: [{provide: LOCALE_ID, useValue: 'de' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
