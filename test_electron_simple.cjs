const electron = require('electron');
console.log('Type of electron export:', typeof electron);
if (typeof electron === 'string') {
  console.log('Electron export is a string (Path):', electron);
} else {
  console.log('Electron export is an object. Keys:', Object.keys(electron));
  console.log('App is defined:', !!electron.app);
}
console.log('process.execPath:', process.execPath);
console.log('process.versions.electron:', process.versions.electron);
console.log('ELECTRON_RUN_AS_NODE:', process.env.ELECTRON_RUN_AS_NODE);

if (electron.app) {
  electron.app.quit();
}
