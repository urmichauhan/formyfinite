// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


export const environment = {
  production: false,

//  yesrapidosduat.yesbank.in
  //apiUrl: 'https://yesrapidosduat.yesbank.in/internaladmin/sd/appiyo/',
  // apiUrl: 'https://13.76.216.136/internaladmin/sd/appiyo/',
  // documentUrl: 'https://13.76.216.136/internaladmin/sd/appiyo/d/drive/docs/',
  // apiUrl: 'https://yesrapidouat.yesbank.in/sdssp/d/dev/sdssp/appiyo/',
  // documentUrl: 'https://yesrapidouat.yesbank.in/sdssp/d/dev/sdssp/appiyo/d/drive/docs/',
  // apiUrl: 'http://128.199.227.253/internaladmin/sd/appiyo/',
  // documentUrl: 'http://128.199.227.253/internaladmin/sd/appiyo/d/drive/docs/',
  apiUrl: 'https://128.199.227.253/internaladmin/sd/appiyo/',
  documentUrl: 'https://128.199.227.253/internaladmin/sd/appiyo/d/drive/docs/',
  apiVersion: 'v2',
  aesPublicKey: 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALSLmgdCK+NnMf8gM0i6nUaWZNqKO2LZqGgys7pDQeRdkej8EIEefrJ9ThtP2PO0hlaiqf+3NFrEP7nJp3HGUeUCAwEAAQ==',
  // appToken: 's131DT9Ge52IIGVNDYwQ1bWS+ecrwyPPP0Yiwd2DRZUfXZJCEMLuKFgxM9RtZPcl'
  /**
 * DEV
 * TEST
 * UAT
+* PROD
 */
 name: 'PREPROD',
 PROJECT_ID: '8686f382257911ebb9910242ac110003'
};
