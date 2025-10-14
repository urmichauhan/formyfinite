import { Component } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { TokenStorage } from 'src/app/core/services/auth/token-storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  username: string = '';
  userInitials: string = '';

  constructor(private tokenStorage: TokenStorage,
    public auth: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.tokenStorage.getUser();
    this.username = user?.username || '';
    this.userInitials = this.getInitials(this.username);
  }

  getInitials(name: string): string {
    if (!name) {
      return '';
    }
    const initials = name.split(' ').map(n => n[0]).join('');
    return initials.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.auth.logout();
  }
}
