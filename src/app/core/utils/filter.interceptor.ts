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
    public commonService: CommonService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    if (request.url.toString().indexOf('authInit') !== -1 || request.url.toString().indexOf('authValidate') !== -1 || request.url.toString().indexOf('authReinit') !== -1) {
      request = request.clone({
        headers: new HttpHeaders({
          'auth-session': this.tokenStorage.getSessionId()
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


    return this.decryptResponse(event);

  }

  decryptResponse(event: any) {
    var timestamp = event.headers.get('tiemestamp');
    var randomkey = event.headers.get('key')
    var responseHash = event.headers.get('hash');
    if (timestamp != null) {
      let decryption = this.encryptionService.decrypt(randomkey, timestamp, responseHash, event.body, environment.aesPublicKey);
      return decryption;
    } else {
      return false;
    }

  }

  redirect(alert: any) {
    this.spinner.hide();
    this.commonService.setQueryParams({
      name: "",
      data: {
        errorMsg: alert,
        errorCode: '700'
      }
    }).subscribe((res: any) => {
      if (res) {
        this.router.navigate(['formyfinite/error']);
      }
    });
  }
}

