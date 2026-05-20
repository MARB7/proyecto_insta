// ╔══════════════════════════════════════════════════════════════════╗
// ║  Ionic — Production Environment (Azure VM)                     ║
// ║                                                                 ║
// ║  This configuration file points all frontend API and storage    ║
// ║  requests to your Microsoft Azure Virtual Machine public IP.    ║
// ╚══════════════════════════════════════════════════════════════════╝

export const environment = {
  production: true,
  apiUrl: 'http://4.248.186.178:8000/api/',
  storageUrl: 'http://4.248.186.178:8000/storage/'
};
