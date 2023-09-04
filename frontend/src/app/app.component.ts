import { Component, OnInit } from '@angular/core';
import { Amplify } from 'aws-amplify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    Amplify.configure({
      Auth: {
        userPoolId: import.meta.env['NG_APP_USERPOOL_ID'],
        userPoolWebClientId: import.meta.env['NG_APP_WEBCLIENT_ID']
      },
      API: {
        endpoints: [{
          name: 'FloraUnimol',
          endpoint: import.meta.env['NG_APP_API_ENDPOINT']
        }]
      }
    })
  }
}
