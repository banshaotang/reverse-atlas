const PIXI = require('pixi.js');
// const spine = require('pixi-spine');

function ready() {

  let renderer = PIXI.autoDetectRenderer(800, 600, {
    antialias: false,
    transparent: false,
    resolution: 1
  });

  document.body.appendChild(renderer.view);

  renderer.view.style.border = "1px dashed red";
  renderer.view.style.position = "absolute";
  renderer.view.style.display = "block";
  renderer.autoResize = true;
  renderer.resize(223, 144);
  // renderer.resize(window.innerWidth - 16, window.innerHeight - 16);

  let stage = new PIXI.Container();

  let images = [{
    name: 'duck',
    url: 'example/duckHunt/duck.png'
  }, {
    name: 'Multiplayer',
    url: 'example/duckHunt/Multiplayer.png'
  }, ];

  PIXI.loader
    .add(images)
    .on("progress", (loader, resource) => {
      console.log("loading: " + resource.url);
    })
    .load(() => {
      console.log("All files loaded........");
      let hehe = PIXI.loader.resources["duck"].texture;
      let texture = new PIXI.Texture(hehe, new PIXI.Rectangle(2, 2, 225, 146));
      let duck = new PIXI.Sprite(texture);
      stage.addChild(duck);
      renderer.render(stage);

      let source = duck.texture.baseTexture.source;
      console.log(source, source.width, source.height, duck.texture.baseTexture.imageUrl);
      console.log(renderer.view.toDataURL());

    });
}

document.addEventListener("DOMContentLoaded", ready, false);
