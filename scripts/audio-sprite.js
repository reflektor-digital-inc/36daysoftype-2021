const path = require('path');
const fs = require('fs');
const util = require('util');
const chalk = require('chalk');
const audiosprite = require('audiosprite');

const readdir = util.promisify(fs.readdir);

const FILE_EXPORT_TYPES = ['ogg', 'mp3', 'ac3', 'm4a'];
const PROJECT_BASE = path.resolve(__dirname, '..');
const MANIFEST_JSON_OUTPUT_FOLDER = path.resolve(PROJECT_BASE, 'src', 'utils');
const BASE_AUDIO_PATH = path.resolve(PROJECT_BASE, 'src', 'assets', 'audio');
const PUBLIC_FOLDER = path.resolve(PROJECT_BASE, 'public');
const SPRITES_FOLDER = path.resolve(PUBLIC_FOLDER, 'sprites');

const grabAudioFiles = async () => {
  const files = await readdir(BASE_AUDIO_PATH);
  const folders = files
    .filter(name => !/\.\w+$/gi.test(name));

  const manifestMap = {};

  const fileTypeFilter = name => /\.(wav|mp3|ogg)$/gi.test(name);

  for (let i = 0; i < folders.length; i += 1) {
    const folderName = folders[i];
    const folderPath = path.resolve(BASE_AUDIO_PATH, folderName);

    // Get base folder audio files
	  const audioFiles = await readdir(folderPath);
	  manifestMap[folderName] = audioFiles
      .filter(fileTypeFilter)
      .map(name => ({
        path : `${folderPath}/${name}`,
        name : name.replace(/\.(wav|mp3|ogg)$/gi, ''),
        loop : false
      }));

    // Get the audio files in the looping folder, only if the folder is there
    const loopingFolder = path.resolve(folderPath, 'looping');
    const loopingFolderExists = fs.existsSync(loopingFolder);
    if (loopingFolderExists) {
      const loopingFiles = await readdir(loopingFolder);
      manifestMap[folderName].push(...loopingFiles
        .filter(fileTypeFilter)
        .map(name => ({
          path : `${folderPath}/looping/${name}`,
          name : name.replace(/\.(wav|mp3|ogg)$/gi, ''),
          loop : true
        })));
    }
  }
  console.info(manifestMap);
  return manifestMap;
};

// audiosprite --loop OST_Ambient_Loop --format howler2 --output cbpc_pr_audio *.wav

const turnIntoSpriteSheet = (fileMap) => {
  const manifestPromises = [];

  for (const [manifestName, arrayOfFiles] of Object.entries(fileMap)) {
	  manifestPromises.push(new Promise((resolve, reject) => {
      if (arrayOfFiles.length <= 0) resolve({});
      const loopingNames = arrayOfFiles.map(({ name, loop }) => loop ? name : null).filter(file => file);
      const options = {
        output : manifestName,
        format : 'howler2',
        loop : loopingNames,
        path : SPRITES_FOLDER.replace(PUBLIC_FOLDER, ''),
        export : FILE_EXPORT_TYPES.join(',')
      };

      audiosprite(arrayOfFiles.map(({ path }) => path), options, (err, manifest) => {
        if (err) return reject(err);
        resolve({ manifestName, manifest });
      });
    }));
  }

  return manifestPromises;
};

const moveFileToSpriteFolder = (filePath, newName) => {
  fs.copyFile(filePath, `${SPRITES_FOLDER}/${newName}`, (err) => {
    if (err) throw err;
    removeFile(filePath);
  });
};

const removeFile = (filePath) => {
  fs.rm(
    filePath,
    (err) => { if (err) throw err; }
  );
};

const removeVersioning = manifest => manifest.replace(/_V\d/gmi, '');

const createManifest = (name, manifest) => {
  const uppercaseName = name[0].toUpperCase() + name.slice(1);
  const path = `${MANIFEST_JSON_OUTPUT_FOLDER}/${uppercaseName}AudioController.js`;

  const spriteNames = Object.entries(manifest.sprite)
    .reduce((total, [key]) => {
		  const name = removeVersioning(key);
      return total + `'${name}' : '${name}', \n  `;
    }, '');

  const file = `import { Howl } from 'howler';
import BaseAudioController from '@utils/BaseAudioController';

const ${name}Manifest = ${
  removeVersioning(JSON.stringify(manifest, null, 2))
    .replace(/"/gi, '\'')
};

const ${name}Sound = new Howl(${name}Manifest);

export const ${name}SpriteNames = {
  ${spriteNames.slice(0, spriteNames.length - 4)}
};

export default new BaseAudioController(${name}Sound, ${name}SpriteNames);
`;

  fs.writeFile(path, file, 'utf8', (err) => {
		  if (err) throw err;
		  console.info(`** ${chalk.green(name)} class created!`);
  });
};

const moveAudioFilesAndCreateManifest = (promises) => {
  Promise.all(promises)
    .then((values) => {
      values.forEach(({ manifestName, manifest }) => {
			  if (!manifestName || !manifest) return;

			  FILE_EXPORT_TYPES.forEach((type) => {
			    const baseFile = `${manifestName}.${type}`;
			    const oldPath = path.resolve(__dirname, '..', baseFile);
          moveFileToSpriteFolder(oldPath, baseFile);
        });
			  createManifest(manifestName, manifest);
      });
    })
    .catch((error) => {
      console.info(error.message);
    });
};

try {
  grabAudioFiles()
    .then(turnIntoSpriteSheet)
    .then(moveAudioFilesAndCreateManifest);
}
catch (error) {
  console.error('audio-sprite.js@:', error.message);
}
