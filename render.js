const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const async = require('async');
const spine = require('./spine-parser');

// let _imageContainer;
// let _canvasContainer;

function crop(image, region) {
  let canvas = document.createElement('canvas');
  canvas.width = region.w;
  canvas.height = region.h;
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  return canvas;
}

// function save(file, dataUrl) {
//   let base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
//   let dir = path.parse(file).dir;
//   mkdirp(dir, function (err) {
//     if (err) {
//       console.error(err);
//     } else {
//       fs.writeFile(file, base64Data, 'base64', function (err) {
//         if (err) {
//           console.log("save [%s] error %s", file, err);
//         } else {
//           console.log("saved", file);
//         }
//       });
//     }
//   });
// }

function parse(src, dest) {

  let srcDir = path.parse(src).dir.replace('/**', '');

  console.log("crop images from %s to %s", src, dest);

  glob(src, function (err, files) {

    files.forEach(function (file, i) {

      //read xxx.atlas file
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          throw err;
        }

        /** path.parse();
        ┌─────────────────────┬────────────┐
        │          dir        │    base    │
        ├──────┬              ├──────┬─────┤
        │ root │              │ name │ ext │
        " C:\      path\dir   \ file  .txt "
        └──────┴──────────────┴──────┴─────┘
        */

        let atlasList = spine.parseAtlas(data);
        let parsedPath = path.parse(file);
        let outputDir = path.join(dest, parsedPath.dir.replace(srcDir, ''));

        console.log(i, file);

        async.waterfall([

          function (next) {

            let images = new Map();

            // while (_imageContainer.firstChild) {
            //   _imageContainer.removeChild(_imageContainer.firstChild);
            // }

            //create images list for each atlas
            atlasList.pages.forEach((page, i) => {
              let img = new Image();
              images.set(page.name, img);
              img.crossOrigin = 'Anonymous';
              img.onload = function () {
                if (i === atlasList.pages.length - 1) {
                  next(null, images);
                }
              };
              img.src = path.join(parsedPath.dir, page.name);
            });
          },

          function (images, next) {

            // let canvasList = new Map();

            //crop image
            atlasList.regions.forEach((region, i) => {

              let atlas = images.get(region.page.name);

              //draw image to canvas
              let canvas = crop(atlas, {
                x: region.x,
                y: region.y,
                w: region.rotate ? region.height : region.width,
                h: region.rotate ? region.width : region.height
              });

              // _canvasContainer.appendChild(canvas);

              let outputFileName = parsedPath.name + '_' + region.name.replace('/', '_') + '.png';
              // canvasList.set(outputFileName, canvas);

              let outputPath = path.join(outputDir, outputFileName);

              //get image data from canvas and save to file
              let base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
              let dir = path.parse(outputPath).dir;
              mkdirp(dir, function (err) {
                if (err) {
                  console.error(err);
                  next(null);
                } else {
                  fs.writeFile(outputPath, base64Data, 'base64', function (err) {
                    if (err) {
                      console.log("save [%s] error %s", outputPath, err);
                    } else {
                      console.log("saved", outputPath);
                    }
                    if (i === atlasList.regions.length - 1) {
                      next(null);
                    }
                  });
                }
              });

            });
          },

          function (next) {
            // while (_canvasContainer.firstChild) {
            //   _canvasContainer.removeChild(_canvasContainer.firstChild);
            // }
            next(null);
          }
      ], function (err) {});
      });
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // _imageContainer = document.getElementById('imageContainer');
  // _canvasContainer = document.getElementById('canvasContainer');

  let srcPath = document.getElementById('src');
  let destPath = document.getElementById('dest');
  srcPath.value = path.join(__dirname, 'example/**/[^~$]*.atlas');
  destPath.value = path.join(__dirname, 'data');

  document.getElementById('start').addEventListener('click', () => {
    let src = document.getElementById('src').value;
    let dest = document.getElementById('dest').value;
    parse(src, dest);
  });

}, false);
