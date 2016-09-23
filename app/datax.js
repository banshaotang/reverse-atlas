/**
 * change various of data format to datax format.
 *
 * datax format:{
 *    page:{name:'',ext:'.png',dir:''}
 *    region:{name:'',page:'',rotate:false,x:0,y:0,w:0,h:0}
 *  }
 */

const fs = require('fs');
const path = require('path');
const spine = require('./spine-parser');

/**
 * load spine atlas data and convert to datax formate
 * @param  {[string]} file [full path of spine .atlas file]
 * @return {[datax]}      [datax format]
 */
function loadSpine(file) {

  /** path.parse();
  ┌─────────────────────┬────────────┐
  │          dir        │    base    │
  ├──────┬              ├──────┬─────┤
  │ root │              │ name │ ext │
  " C:\      path\dir   \ file  .txt "
  └──────┴──────────────┴──────┴─────┘
  */

  let dir = path.parse(file).dir;

  //load atlas file from disk.
  let content = fs.readFileSync(file, 'utf8');

  //parse atlas to json
  let spinAtlas = spine.parseAtlas(content);

  let result = {
    pages: new Map(),
    regions: new Map()
  };

  //parse to datax format.
  spinAtlas.pages.forEach((page) => {

    let parsedPath = path.parse(page.name);

    result.pages.set(page.name, {
      name: parsedPath.name,
      ext: parsedPath.ext,
      dir: dir
    });

  });

  //parse to datax format.
  spinAtlas.regions.forEach((region) => {
    let name = region.name.replace('/', '_');
    result.regions.set(name, {
      name: name,
      page: region.page.name,
      rotate: region.rotate,
      x: region.x,
      y: region.y,
      w: region.width,
      h: region.height
    });
  });

  return result;

}

module.exports = exports = {
  loadSpine: loadSpine
};
