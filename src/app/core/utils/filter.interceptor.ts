import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { TokenStorage } from '../services/auth/token-storage.service';
import { EncryptionService } from '../encryption/encryption.service'
import { environment } from 'src/environments/environment';
import { Constants, AlertMessages } from '../../app.constant';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseAPIService } from '../services/base-api-service.service';
import { CommonService } from '../services/common.service';

@Injectable()
export class FilterInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private auth: AuthService,
    private tokenStorage: TokenStorage,
    private encryptionService: EncryptionService,
    private spinner: NgxSpinnerService,
    public commonService:CommonService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // if (this.tokenStorage.getAccessToken() === null) {
    //   request = request.clone({
    //     setHeaders: {
    //       'Content-Type': 'application/x-www-form-urlencoded'
    //     }
    //   });
    // } else if (request.url.toString().indexOf('upload_excel') !== -1) {
    //   request = request.clone({
    //     setHeaders: {
    //       'authentication-token': this.tokenStorage.getAccessToken()
    //     }
    //   });
    // } else if (request.url.toString().indexOf('upload') !== -1) {
    //   request = request.clone({
    //     setHeaders: {
    //       // 'Content-Type': 'multipart/form-data',
    //       'authentication-token': this.tokenStorage.getAccessToken()
    //       // 'Authorization': 'Bearer ' + sessionStorage.getItem(Constants.BEARER_TOKEN),
    //     }
    //   });
    // } else if (
    //   this.tokenStorage.getAccessToken() !== 'undefined' &&
    //   this.tokenStorage.getBearerToken()
    // ) {
    //   request = request.clone({
    //     setHeaders: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //       'authentication-token': this.tokenStorage.getAccessToken(),
    //       Authorization: 'Bearer ' + this.tokenStorage.getBearerToken()
    //     }
    //   });
    // } else {
    //   request = request.clone({
    //     setHeaders: {
    //       'Content-Type': 'application/x-www-form-urlencoded',
    //       'authentication-token': this.tokenStorage.getAccessToken()
    //     },
    //     // body: body
    //   });
    // }

    // IF auth_init,auth_validate and auth_reinit is not than set session at header which you get on initial API on yes click 
    if (request.url.toString().indexOf('auth_init') !== -1 || request.url.toString().indexOf('auth_validate') !== -1 || request.url.toString().indexOf('auth_reinit') !== -1) {
      request = request.clone({
        headers: new HttpHeaders({
          'X-AUTH-SESSIONID': this.tokenStorage.getSessionId()
        })
      });
    }
    else if (this.tokenStorage.getAccessToken()) {
      request = request.clone({
        setHeaders: {
          'authentication-token': this.tokenStorage.getAccessToken()
        },
      });
    }
  
    if (!request.headers.has(Constants.InterceptorSkipHeader) && request.method != "GET") {
      let encryption = this.encryptionService.encrypt((request.body), environment.aesPublicKey);
      request = request.clone({
        setHeaders: encryption.headers,
        body: encryption.rawPayload,
        responseType: 'text'
      });
    }
    else if (request.headers.has(Constants.InterceptorSkipHeader)) {
      const headers = request.headers.delete(Constants.InterceptorSkipHeader);
      request = request.clone({ headers })
    }

    // return next.handle(request).pipe(map(event => {
        //   if (event instanceof HttpResponse) {

           
        //     console.log("Resp ", this.decryptResponse(event));

        //     if(request.url.toString().indexOf('upload') === -1 && (this.decryptResponse(event) || this.decryptResponse(event) == false)){
        //       let response = this.decryptResponse(event) ? JSON.parse(this.decryptResponse(event)) : false;
        //       if(response == false || ('payload' in response && 'error' in response['payload'] && 
        //       (typeof(response['payload']['error']) == 'string' || (typeof(response['payload']['error']) == 'object' && 
        //       'code' in response['payload']['error'] && response['payload']['error']['code'] == 2001)))){
        //         console.log("expired session");
        //         this.redirect(AlertMessages.EXPIREDSESSION);
        //         return
        //       }
        //     }

        //     // Error mapping starts
        //     if(this.decryptResponse(event)){
        //       let response = JSON.parse(this.decryptResponse(event));
        //       if(request.url.toString().indexOf('create_session') === -1 && request.url.toString().indexOf('execute') === -1 && response['payload']['processResponse']['Error'] === '1'){
        //         this.redirect(AlertMessages.SOMETHING_WRONG);
        //       }
        //       if(request.url.toString().indexOf('execute') !== -1 && response['Error'] === '1'){
        //         this.redirect(AlertMessages.SOMETHING_WRONG);
        //       }
        //     }
        //     // error mapping issue end
           
        //   }

        //   return event;
        // // },
        // (error:any) => {
        //   if (error instanceof HttpErrorResponse) {
        //     let custerror = this.decryptResponse(error.error)
        //     if (custerror) {
        //       this.decryptResponse(error.error)
        //     }
        //     if (error.status === 401) {
        //       // redirect to the login route
        //       // or show a modal
        //       this.router.navigate(['/notfound']);
        //     }
        //   } else {
        //     if (
        //       'body' in error &&
        //       'login_required' in error['body'] &&
        //       error['body']['login_required'] === true
        //     ) {
        //       this.auth.alertToUser(AlertMessages.SESSION_EXPIRED);
              
        //       this.tokenStorage.clear();
        //       // this.auth.logout(false);
        //       throw new Error(AlertMessages.SESSION_EXPIRED);
        //       // this.auth.alertToUser(AlertMessages.SESSION_EXPIRED, true, true);
        //       // throw new Error(AlertMessages.SESSION_EXPIRED);
        //     } else {
        //       this.auth.alertToUser(AlertMessages.SERVER_ERROR);
        //     }
        //   }
        // }
      // )
    // );
    return this. decryptResponse(event);
    
  }

  decryptResponse(event:any) {
    var timestamp = event.headers.get('x-appiyo-ts')
    var randomkey = event.headers.get('x-appiyo-key')
    var responseHash = event.headers.get('x-appiyo-hash');
    if (timestamp != null) {
      let decryption = this.encryptionService.decrypt(randomkey, timestamp, responseHash, event.body, environment.aesPublicKey);
      return decryption;
    } else {
      return false;
    }

  }

  redirect(alert:any){
    this.spinner.hide();
    if(JSON.parse(this.tokenStorage.getSrId()).id == 1025){
      this.commonService.setQueryParams({
        name: 'Outward-remittance',
        data: {
          errorMsg: alert,
          errorCode : '700'
        }
      }).subscribe((res: any) => {
        if (res) {
          this.router.navigate(['dashboard-non-financial/error']);
        }
      });
    } else {
      this.tokenStorage.clear();
      }
    }
}

