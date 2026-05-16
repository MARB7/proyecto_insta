// ╔══════════════════════════════════════════════════════════════════╗
// ║  Ionic — Production Environment (Azure Static Web Apps)        ║
// ║                                                                 ║
// ║  INSTRUCTIONS:                                                  ║
// ║  Replace "REPLACE_BACKEND_NAME" with your actual Azure          ║
// ║  App Service name before running `ng build --configuration      ║
// ║  production`                                                    ║
// ╚══════════════════════════════════════════════════════════════════╝

export const environment = {
  production: true,
  apiUrl: 'https://REPLACE_BACKEND_NAME.azurewebsites.net/api/',
  storageUrl: 'https://REPLACE_BACKEND_NAME.azurewebsites.net/storage/'
};
