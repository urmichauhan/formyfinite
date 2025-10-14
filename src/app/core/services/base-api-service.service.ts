import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Constants } from 'src/app/app.constant';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class BaseAPIService {
  baseUrl = "";
  apiUrl = "";
  objs: any = [];
  abc: any;
  acde: any;
  dye: any;
  get_version: any;
  getVersion: any;
  processInstanceId: any;
  errorCode:any = '';

  constructor(private http: HttpClient, private router: Router) { }
  
  // restrict to enter spcl character and alphanmeric 
  spclChar_and_alpahnumer_restrict(event:any) {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);

    if (!pattern.test(inputChar)) {
      // invalid character, prevent input
      event.preventDefault();
    }
    var k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }

  // restrict Spcl character
  spcChar(event:any) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
    // if (/[$&+,:;=?@#|'<>.^*()%!-]/.test(this.inputs)) {
    //   event.preventDefault();
    // }
  }

  authError() {
    this.router.navigateByUrl('formyfinite/invalid');
  }
  

}