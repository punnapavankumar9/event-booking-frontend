import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-oauth2-success',
  imports: [],
  templateUrl: './oauth2-success.component.html',
  styleUrl: './oauth2-success.component.scss'
})
export class Oauth2SuccessComponent implements OnInit {
  ngOnInit() {
    // @ts-ignore
    const jwt = document?.cookie?.match(/^(?:.*\s)*auth_jwt=([^;]+)/)[1];
    window.opener.postMessage({jwt}, '*');
    window.close();
  }
}
