import { Component, Inject } from '@angular/core';
// import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { map, mapTo } from 'rxjs/operators';
import { AuthService } from '../core/services/auth/auth.service';
import { Observable, fromEvent, merge, of } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { DOCUMENT, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertMessages, ApplicationVersion } from '../app.constant';
import { NgxSpinnerService } from 'ngx-spinner';
import { TokenStorage } from '../core/services/auth/token-storage.service';
import { BaseAPIService } from '../core/services/base-api-service.service';

@Component({
  selector: 'dashboard-nav',
  templateUrl: './dashboard-nav.component.html',
  styleUrls: ['./dashboard-nav.component.scss']
})

export class DashboardNavComponent {
  APP_VERSION = ApplicationVersion.APP_VERSION;
  online$: Observable<boolean>;
  date = new Date();
  isProfileMenuOpen = false;
  user:any = null;

  constructor(
    location: Location,
    // private breakpointObserver: BreakpointObserver,
    public auth: AuthService,
    public common: CommonService,
    // public dialog: MatDialog,
    public router: Router,
    public baseAPI: BaseAPIService,
    private spinner: NgxSpinnerService,
    private tokenStorage: TokenStorage,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.online$ = merge(
      of(navigator.onLine),
      fromEvent(window, 'online').pipe(mapTo(true)),
      fromEvent(window, 'offline').pipe(mapTo(false))
    );
    this.networkStatus();


    // this.route.queryParams.subscribe(queryParams => {
    
    // });
  }


  ngOnInit() {
    console.log('first',this.router.url.toString(),this.tokenStorage.getUser())
     this.user = this.tokenStorage.getUser();
  }

  /**
   * @description logo click event
   */
  rootLogo() {
    window.scroll(0,0);
  }

  /**
   * @description Navigation method @param url @param ref reference id
   */
  navigate(url,ref) {
    if(ref){
      this.router.navigate([url],{ fragment: ref });
    } else {
      this.router.navigate([url]);
    }
    console.log('url',this.router.url);
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  getInitials(): string {
    if (this.user && this.user.name) {
      const names = this.user.name.split(' ');
      return names.map(n => n.charAt(0)).join('').toUpperCase();
    }
    return '';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
  
  // Internet On / Off status
  public networkStatus() {
    this.online$.subscribe(value => {
      if (value === false) {
        this.auth.alertToUser('You are offline', false, true);
      }
    });
  }

  /**
   * @description send email method
   */
  emailSend() {
    console.log('url',this.router.url);
    window.open("mailto:codarize@gmail.com","_blank"); 
  }

}
