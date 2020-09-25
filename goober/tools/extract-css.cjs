
const {create} = require('jss');
const {default: preset} = require('jss-preset-default');
const {default: vendorPrefixer} = require('jss-plugin-vendor-prefixer');

const rollup = require('rollup');
const fs = require('fs');
const pathLib = require('path');

const jss = create();
jss.setup(preset());
jss.use(vendorPrefixer());

function mkdir(path, options = {}) {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, options, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

function dashCase(s) {
  return s.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

async function rollupJss(path) {
  const bundle = await rollup.rollup({
    input: path,
    plugins: [],
  });
  const {output} = await bundle.generate({
    format: 'cjs',
    sourcemap: false,
  });
  const result = output[0].code;

  const rollupPath = pathLib.resolve('build', 'jss-rolloup', path);
  await mkdir(pathLib.dirname(rollupPath), {recursive: true});
  await writeFile(rollupPath, result);
  return rollupPath;
}

async function processJss(path) {
  const rollupFile = await rollupJss('src/View1.css.js');

  const {default: styles} = await import(rollupFile);
  console.log('JSS STYLES: ');
  console.log(styles);

  const stylesheet = jss.createStyleSheet(styles, {
    generateId: (rule, sheet) => `i-${dashCase(rule.key)}`,
  });

  console.log('CSS: ');
  console.log(stylesheet.toString());

  console.log('classes: ', stylesheet.classes);
}

processJss('src/View1.css.js');
