import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { MainComponent } from './main/main.component';
import { LayoutModule } from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatSlideToggleModule,
} from '@angular/material';
import { SellsComponent } from './main/sells/sells.component';
import { SellComponent } from './main/sell/sell.component';
import { ReactiveFormsModule } from '@angular/forms';
import { VehiculeSellComponent } from './main/sell/vehicule-sell/vehicule-sell.component';
import { DroidSellComponent } from './main/sell/droid-sell/droid-sell.component';
import { CommonModule } from '@angular/common';
import { SpaceshipComponent } from './main/sell/vehicule-sell/spaceship/spaceship.component';
import { LandComponent } from './main/sell/vehicule-sell/land/land.component';
import { ProtocolDroidComponent } from './main/sell/droid-sell/protocol-droid/protocol-droid.component';
import { MedicalDroidComponent } from './main/sell/droid-sell/medical-droid/medical-droid.component';
import { AstromechDroidComponent } from './main/sell/droid-sell/astromech-droid/astromech-droid.component';
import { AssassinDroidComponent } from './main/sell/droid-sell/assassin-droid/assassin-droid.component';

const MATERIAL_MODULES = [
  LayoutModule,
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatSelectModule,
  MatSlideToggleModule,
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    SellsComponent,
    SellComponent,
    VehiculeSellComponent,
    DroidSellComponent,
    SpaceshipComponent,
    LandComponent,
    ProtocolDroidComponent,
    MedicalDroidComponent,
    AstromechDroidComponent,
    AssassinDroidComponent,
  ],
  imports: [BrowserModule, BrowserAnimationsModule, CommonModule, ReactiveFormsModule, ...MATERIAL_MODULES],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
