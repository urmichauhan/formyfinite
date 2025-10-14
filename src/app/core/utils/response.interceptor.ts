import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { TokenStorage } from '../services/auth/token-storage.service';
import { AlertMessages } from 'src/app/app.constant';

@Injectable()
export class FilterInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private auth: AuthService,
    private tokenStorage: TokenStorage,
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.tokenStorage.getAccessToken() === null) {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
    } else if (request.url.toString().indexOf('upload_excel') !== -1) {
      request = request.clone({
        setHeaders: {
          'authentication-token': this.tokenStorage.getAccessToken()
        }
      });
    } else if (request.url.toString().indexOf('upload') !== -1) {
      request = request.clone({
        setHeaders: {
          // 'Content-Type': 'multipart/form-data',
          'authentication-token': this.tokenStorage.getAccessToken()
          // 'Authorization': 'Bearer ' + sessionStorage.getItem(Constants.BEARER_TOKEN),
        }
      });
    } else if (
      this.tokenStorage.getAccessToken() !== 'undefined' &&
      this.tokenStorage.getBearerToken()
    ) {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'authentication-token': this.tokenStorage.getAccessToken(),
          Authorization: 'Bearer ' + this.tokenStorage.getBearerToken()
        }
      });
    } else {
      request = request.clone({
        setHeaders: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'authentication-token': this.tokenStorage.getAccessToken()
        },
        // body: body
      });
    }

    return next.handle(request).pipe(
      tap(
        (event) => {

          if (event instanceof HttpResponse) {
            // if (event.headers.get('ACCESS_TOKEN')) {
            //   this.tokenStorage.setBearerToken(
            //     event.headers.get('ACCESS_TOKEN')
            //   );
            // }
            if (event.body && event.body.status === 401 && event.body.message === 'Unauthorized') {
              this.auth.alertToUser(AlertMessages.SESSION_EXPIRED);
              throw new Error(AlertMessages.SESSION_EXPIRED);
            }

            event = event.clone({ body: null });
            return event;

          }


        },
        error => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              // redirect to the login route
              // or show a modal
              this.router.navigate(['/notfound']);
            }
          } else {
            this.auth.alertToUser(AlertMessages.SERVER_ERROR);
          }
        }
      )
    );
  }
}
