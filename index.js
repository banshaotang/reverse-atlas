const {
  app,
  BrowserWindow
} = require('electron');

let _mainWindow;

function ready() {

  _mainWindow = new BrowserWindow({
    width: 1024,
    height: 840
  });

  _mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  _mainWindow.webContents.openDevTools();

  _mainWindow.on('closed', function() {
    _mainWindow = null;
  });

}

app.on('ready', ready);

app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if(process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function() {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if(_mainWindow === null) {
    ready();
  }
});

// fs.readFile('./example/bonusWheelOutro.atlas', 'utf8', (err, data) => {
//   if(err)
//     throw err;
//
//   let atlas = new spine.parse(data);
//
//   // console.log(atlas.regions);
//
//   clipper('./example/bonusWheelOutro.png', function() {
//     this.crop(964, 2, 166, 125)
//       .toFile('./example/result.png', function() {
//         console.log('saved!');
//       });
//   });

//   x: 964,
// y: 2,
// width: 166,
// height: 125,

// fs.writeFile('./data/demo.json', output, function(err) {
//   if(err) {
//     console.log("error：", err);
//     throw err;
//   }
//   console.log('exported successfully  -->  ');
// });
