const sharp = require("sharp");
const fs = require("fs");
const basePath = process.cwd();
const dataDir = `${basePath}/game/images/resources`;
const buildDir = `${basePath}/build`;

const run = () => {
  console.log("read directory..");
  const files = fs.readdirSync(dataDir);
  console.log("start crobbing..");
  files.forEach((file) => {
    console.log("crob: ", file);
    sharp(`${dataDir}/${file}`)
      .extract({ left: 420, top: 420, width: 660, height: 660 })
      .toFile(`${buildDir}/${file}`, (error) => console.log(error));
  });
};

run();
