import { Component, OnInit } from '@angular/core';
import { TokenStorage } from 'src/app/core/services/auth/token-storage.service';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css']
})
export class ErrorComponent implements OnInit {

  constructor(private tokenStorage : TokenStorage) {
   }

  ngOnInit() {
    this.tokenStorage.clear();
  }

}
