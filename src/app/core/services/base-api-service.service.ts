import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { Constants } from 'src/app/app.constant';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

//const SERVER_URL = environment.apiUrl;
// https://{host}/appiyo/d/workflows/cc847fb2c95e11e9933d8e7a151d5229/v2/execute

@Injectable({
  providedIn: 'root'
})
export class BaseAPIService {
  // Switched to Route checking
  // isRetailBanking: boolean = false;
  // isLoan: boolean = false;

  baseUrl = environment.apiUrl;
  objs: any = [];
  abc: any;
  acde: any;
  dye: any;
  srId: any;
  crmId: any;
  get_version: any;
  acc_details: any
  getVersion: any;
  fdAccountNumber: any = 0;
  serviceRequestType: any;
  processInstanceId: any;
  errorCode:any = '';

  constructor(private http: HttpClient, private router: Router) { }

  // generate Session Id
  generate_session(workflowId: any, params: any) {
    let timestamp = new Date().getTime().toString();
    let SERVER_URL = this.baseUrl + `d/workflows/${workflowId}/${environment.apiVersion}/execute?t=${timestamp}`;
    return this.http.post(`${SERVER_URL}`, JSON.stringify(params));
  }

  
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
    this.router.navigateByUrl('/invalid');
  }

  downloadSRDoc(srID:any): Observable<any> {
    let timestamp = new Date().getTime().toString();
    const processId = 'cd2b0ae6ee5011e983388a71c4611c6d';
    const projectId = Constants.PROJECT_ID;
    let ProcessVariables = {
      'srId': srID
    }
    const apiUrl = `${environment.apiUrl}d/download/pdf?content_var=modelData&template_var=template&processVariables={"processId":"${processId}","projectId":"${projectId}","ProcessVariables":${JSON.stringify(ProcessVariables)}}&t=${timestamp}`;
    return this.http.get(apiUrl, { responseType: "blob" });
  }


  

}