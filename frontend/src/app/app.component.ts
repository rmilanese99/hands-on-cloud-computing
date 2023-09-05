import { Component, OnInit } from '@angular/core';
import { API, Amplify, Auth } from 'aws-amplify';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public prediction: string = '';

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
    });
  }

  public async getPrediction(): Promise<void> {
    this.predict().then((prediction) => {
      this.prediction = prediction;
    })
    .catch((error) => {
      console.error(error);
    })
  }

  private async predict(): Promise<string> {
    const token = (await Auth.currentSession()).getAccessToken().getJwtToken();

    return API.get('FloraUnimol', '', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}
