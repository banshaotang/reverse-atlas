const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const async = require('async');
const datax = require('./app/datax');

function loadImages(pages, cb) {

  let images = new Map();

  let index = 0;

  //create images list for each atlas
  pages.forEach((page, name) => {
    let img = new Image();
    images.set(name, img);
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      index++;
      if (index === pages.size) {
        cb(images);
      }
    };

    //.png file is in the same directory with .atlas file.
    img.src = path.join(page.dir, name);
  });
}

//get image data from canvas and save to file.
function save(file, canvas, cb) {
  let base64Data = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, "");
  let dir = path.parse(file).dir;
  mkdirp(dir, function (err) {
    if (err) {
      console.error(err);
      cb();
    } else {
      fs.writeFile(file, base64Data, 'base64', function (err) {
        if (err) {
          console.log("save [%s] error %s", file, err);
        } else {
          console.log("extract ---> ", file);
        }
        cb();
      });
    }

  });
}

function crop(image, region) {
  let canvas = document.createElement('canvas');

  // let rotate = region.rotate;
  // let width = rotate ? region.h : region.w;
  // let height = rotate ? region.w : region.h;

  canvas.width = region.w;
  canvas.height = region.h;

  let ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (region.rotate) {
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(image, region.x, region.y, region.h, region.w, -canvas.height / 2, -canvas.width / 2, canvas.height, canvas.width);
  } else {
    ctx.drawImage(image, region.x, region.y, region.w, region.h, 0, 0, region.w, region.h);
  }

  return canvas;
}

function parse(src, dest) {

  console.log("crop images from %s to %s", src, dest);

  let srcDir = path.parse(src).dir.replace('/**', '');

  glob(src, function (err, files) {

    files.forEach(function (file, i) {

      /** path.parse();
      ┌─────────────────────┬────────────┐
      │          dir        │    base    │
      ├──────┬              ├──────┬─────┤
      │ root │              │ name │ ext │
      " C:\      path\dir   \ file  .txt "
      └──────┴──────────────┴──────┴─────┘
      */

      let atlas = datax.loadSpine(file);
      let parsedPath = path.parse(file);

      //keep output sub directory the same as the source.
      // let outputDir = path.join(dest, parsedPath.dir.replace(srcDir, ''));

      console.log(i, file);

      async.waterfall([

          function (next) {
          loadImages(atlas.pages, (images) => {
            next(null, images);
          });
          },

          function (images, next) {

          //get slices from the atlas
          atlas.regions.forEach((region, key) => {

            let img = images.get(region.page);

            //draw image to canvas
            let canvas = crop(img, region);

            //keep sub dir the same as the src.
            let subDir = parsedPath.dir.replace(srcDir, '');

            let destFile = path.join(dest, subDir, parsedPath.name + '_' + region.name + ".png");

            let index = 0;

            save(destFile, canvas, () => {
              index++;
              if (index === atlas.regions.size) {
                next(null);
              }
            });

          });
          },

          function (next) {
          console.log("----------------------------------------");
          next(null);
          }
      ], function (err) {});
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {

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
