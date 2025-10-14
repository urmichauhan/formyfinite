import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { TokenStorage } from '../services/auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService,private router: Router, private tokenstorage: TokenStorage) { }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      console.log('route', this.auth.isCheckRoute)
    if (this.auth.isCheckRoute == false){
      console.log("IN Auth Guard ...");
      this.tokenstorage.clear();
      this.router.navigate(['/']);
      return false;
    }
    return true;

  }
}
