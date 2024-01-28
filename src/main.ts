import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import 'hammerjs';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();

  /*************************************
   * Uncomment = Hide Logs = UAT/PROD
   * Comment = Show Logs = TESTING/DEV
   * 
   * To block console enable comment
  *************************************/
  if (environment.name == 'UAT' || environment.name == 'PROD') {
    if (window) {
      window.console.log = function () { };
      window.console.info = function () { };
      window.console.debug = function () { };
    }
  }
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
