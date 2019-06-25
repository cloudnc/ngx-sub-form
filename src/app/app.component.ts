import { Component, OnInit } from '@angular/core';
import { MainForm, Gender } from './reset-example/interfaces';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ngx-sub-form-demo';

  data$ = new Subject<MainForm>();

  _initialValues =
  {
    "personalDetails": {
      "name": {
        "firstname": 'randomString',
        "lastname": 'randomString'
      },
      "gender": Gender.MALE,
      "address": {
        "streetaddress": 'randomString',
        "city": 'randomString',
        "state": 'randomString',
        "zip": 'randomString',
        "country": 'randomString'
      },
      "phone": {
        "phone": 'randomString',
        "countrycode": 'randomString'
      }
    }
  };

  get initialValues() {
    return JSON.parse( JSON.stringify(this._initialValues));
  }

  ngOnInit() {
    setTimeout(() => this.data$.next(this.initialValues), 1500);
  }





}
