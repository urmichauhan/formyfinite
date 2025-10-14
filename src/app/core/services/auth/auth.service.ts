import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AlertMessages, Constants } from 'src/app/app.constant';
import { TokenStorage } from './token-storage.service';
import { CommonService } from '../common.service';
import { map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isCheckRoute = false;
  loggedIn = false;
  brokerLoggedIn = false;
  brokerVerified = false;
  contractorLoggedIn = false;
  contractorVerified = false;
  isREHMember = false;
  private apiUrl = environment.apiUrl;  username: string = "";
  
  constructor(
    private router: Router,
    // public snackBar: MatSnackBar,
    private tokenStorage: TokenStorage,
    private common: CommonService,
    private http:HttpClient
  ) {}

  public resetLoginDetails() {
    // this.arrAllowedRoutes = [];
    this.tokenStorage.removeKey(Constants.ROUTES);
    this.tokenStorage.removeKey(Constants.PARAM_DATA);
    this.common.clearAllParamData();
    this.tokenStorage.clear();
    this.loggedIn = false;
  }

  decodeUserFromToken(token:any) {
    return token;
  }

  alertToUser(message:any, logout: boolean = false, isError: boolean = false) {
    if(message){
      message = message.replace(/  +/g, ' ');
    }
    let msg = message;
    if(!msg || msg == '' || msg.trim() == ''){
      message = AlertMessages.SOMETHING_WRONG;
    }
    
    if (isError) {
      // snackbarConfig.panelClass = ['red-snackbar'];
    }
    if (!logout) {
      // this.snackBar.open(message, '', snackbarConfig);
    }
    if (logout && this.loggedIn) {
      // this.snackBar.open(message, '', snackbarConfig);
      // this.logout(false);
    }
    console.log(msg);
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  logout(): void {
    // Clear the token and user information from session storage
    this.tokenStorage.signOut();

    // Optionally, you can navigate the user to the login page after logging out
    this.router.navigate(['/auth']);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        this.tokenStorage.saveToken(response['token']);
        this.tokenStorage.saveUser(response['user']);
        return response;
      }));
  }
}
