import { Injectable } from '@angular/core';
import { Constants } from 'src/app/app.constant';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class TokenStorage {
  srType: any;
  constructor(private router: Router) { }

  ENCRYPTION_KEY = '';

  tempToken :any;
  private readonly TOKEN_KEY = 'auth-token';
  private readonly USER_KEY = 'auth-user';
  
  /**
	 * Get access token
	 * @returns {Observable<string>}
	 */
  public getAccessToken(): string {
    if (this.tempToken) {
      this.setAccessToken(this.tempToken);
      return this.tempToken;
    }
    const token: string = <string>sessionStorage.getItem(Constants.ACCESS_TOKEN);
    this.tempToken = token;
    return token;
  }

  getSelectServices() {
    var Srid = sessionStorage.getItem('srid');
    console.log(Srid);
  }

  /**
	 * Get bearer token
	 * @returns {Observable<string>}
	 */
  public getBearerToken(): string {
    const token: string = <string>sessionStorage.getItem(Constants.BEARER_TOKEN);
    return token;
  }

  /**
  * Get session Id 
  * @returns {Observable<string>}
  */
  public getSessionId(): string {
    const sessionId: string = <string>sessionStorage.getItem(Constants.SESSION_ID);
    return sessionId;
  }



  /**
	 * Set access token
	 * @returns {TokenStorage}
	 */
  public setAccessToken(token: string): TokenStorage {
    this.tempToken = token;
    sessionStorage.setItem(Constants.ACCESS_TOKEN, token);
    return this;
  }

  /**
	 * Set session id 
	 * @returns {TokenStorage}
	 */
  public setSessionId(sessionId:any): TokenStorage {
    sessionStorage.setItem(Constants.SESSION_ID, sessionId);
    return this;
  }

  /**
	 * Set refresh token
	 * @returns {TokenStorage}
	 */
  public setBearerToken(token: string): TokenStorage {
    if (token) {
      sessionStorage.setItem(Constants.BEARER_TOKEN, token);
    }
    return this;
  }

  public removeKey<T>(key:any) {
    sessionStorage.removeItem(key);
  }

  public setRouteData(key:any, value:any) {
    if (value) {
      const valueEnc = CryptoJS.AES.encrypt(JSON.stringify(value), this.ENCRYPTION_KEY).toString();
      return sessionStorage.setItem(key, valueEnc);
    }
    return null;
  }

  public setParamData(key:any, value:any) {
    if (value) {
      const valueEnc = CryptoJS.AES.encrypt(JSON.stringify(value), this.ENCRYPTION_KEY).toString();
      return sessionStorage.setItem(key, valueEnc);
    }
    return null;
  }

  public getRouteData() {
    try {
      const routeData = sessionStorage.getItem(Constants.ROUTES);
      if (routeData) {
        const bytes = CryptoJS.AES.decrypt(routeData, this.ENCRYPTION_KEY);
        const routeDataDec = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return routeDataDec;
      }
    } catch (err) {
      this.clear();
      this.router.navigate(['/formyfinite']);
    }
  }

  public getParamData() {
    try {
      const paramData = sessionStorage.getItem(Constants.PARAM_DATA);
      if (paramData) {
        const bytes = CryptoJS.AES.decrypt(paramData, this.ENCRYPTION_KEY);
        const paramDataDec = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return paramDataDec;
      }
    } catch (err) {
      this.clear();
      this.router.navigate(['/formyfinite']);
    }
  }

  signOut() {
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(this.TOKEN_KEY);
    window.sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.sessionStorage.getItem(this.TOKEN_KEY);
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(this.USER_KEY);
    window.sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(this.USER_KEY);
    if (user) {
      return JSON.parse(user);
    }
    return null;
  }

  p
  /**
	 * Remove tokens
	 */
  public clear() {
    sessionStorage.removeItem(Constants.ACCESS_TOKEN);
    sessionStorage.removeItem(Constants.BEARER_TOKEN);
    sessionStorage.removeItem(Constants.SESSION_ID);
    sessionStorage.clear();
    this.tempToken = null;
  }
}
