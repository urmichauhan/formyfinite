import { Component, OnInit } from '@angular/core';
import { TokenStorage } from '../../services/auth/token-storage.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private tokenStorage: TokenStorage) { }

  ngOnInit() {
    this.tokenStorage.clear();
  }

}
