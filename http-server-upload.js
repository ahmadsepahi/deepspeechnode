//npm deepspeech 
//based on client.js file
'use strict';
const Ds = require('deepspeech');
const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const Sox = require('sox-stream');

const MemoryStream = require("memory-stream");
const Wav = require("node-wav");
const Duplex = require("stream").Duplex;

const port = process.env.PORT || 8080;
const uploadDir = process.env.UPLOAD_DIR || process.argv[2] || process.cwd();
const uploadTmpDir = process.env.UPLOAD_TMP_DIR || uploadDir;
const token = process.env.TOKEN || false;
const pathMatchRegExp = (process.env.PATH_REGEXP) ? new RegExp(process.env.PATH_REGEXP) : /^[a-zA-Z0-9-_/]*$/;

http.createServer(function (req, res) {
  if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
    const form = new formidable.IncomingForm({
      uploadDir: uploadTmpDir,
      multiples: true
    });
    var newpath='';
    form.parse(req, function (err, fields, files) {
      if (token && fields.token !== token) {
        res.write('Wrong token!');
        return res.end();
      }

      if (!Array.isArray(files.uploads)) {
        files.uploads = [files.uploads];
      }

      if (fields.path) {
        if (!fields.path.match(pathMatchRegExp)) {
          res.write('Invalid path!');
          return res.end();
        }
      } else {
        fields.path = '';
      }

      fs.stat(path.join(uploadDir, fields.path), (err, stats) => {
        if (err) {
          res.write('Path does not exist!');
          return res.end();
        }

        files.uploads.forEach((file) => {
          if (!file) return;
          const newPath = path.join(uploadDir, fields.path, file.name);
          newpath=newPath;
          fs.renameSync(file.path, newPath);
          console.log(new Date().toUTCString(), '- file uploaded', newPath);
        });

//////
var data='';


function totalTime(hrtimeValue) {
  return (hrtimeValue[0] + hrtimeValue[1] / 1000000000).toPrecision(4);
}

function candidateTranscriptToString(transcript) {
  var retval = ""
  for (var i = 0; i < transcript.tokens.length; ++i) {
    retval += transcript.tokens[i].text;
  }
  return retval;
}

// sphinx-doc: js_ref_model_start
//console.error('Loading model from file deepspeech-0.7.3-models.pbmm');
const model_load_start = process.hrtime();
let model = new Ds.Model('deepspeech-0.7.3-models.pbmm');
const model_load_end = process.hrtime(model_load_start);
//console.error('Loaded model in %ds.', totalTime(model_load_end));

// sphinx-doc: js_ref_model_stop

let desired_sample_rate = model.sampleRate();

  //console.error('Loading scorer from file deepspeech-0.7.3-models.scorer');
  const scorer_load_start = process.hrtime();
  model.enableExternalScorer('deepspeech-0.7.3-models.scorer');
  const scorer_load_end = process.hrtime(scorer_load_start);
  //console.error('Loaded scorer in %ds.', totalTime(scorer_load_end));

console.log(newpath);
const buffer = fs.readFileSync(newpath);
const result = Wav.decode(buffer);

if (result.sampleRate < desired_sample_rate) {
  console.error(`Warning: original sample rate ( ${result.sampleRate})` +
                `is lower than ${desired_sample_rate} Hz. ` +
                `Up-sampling might produce erratic speech recognition.`);
}

function bufferToStream(buffer) {
  var stream = new Duplex();
  stream.push(buffer);
  stream.push(null);
  return stream;
}


function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

let audioStream = new MemoryStream();
bufferToStream(buffer).
  pipe(Sox({
    global: {
      'no-dither': true,
      'replay-gain': 'off',
    },
    output: {
      bits: 16,
      rate: desired_sample_rate,
      channels: 1,
      encoding: 'signed-integer',
      endian: 'little',
      compression: 0.0,
      type: 'raw'
    }
  })).
  pipe(audioStream);


audioStream.on('finish', () => {
  let audioBuffer = audioStream.toBuffer();

  const inference_start = process.hrtime();
  //console.error('Running inference.');
  const audioLength = (audioBuffer.length / 2) * (1 / desired_sample_rate);

  // sphinx-doc: js_ref_inference_start
    data = model.stt(audioBuffer);
console.log(data);

///Translate

// Imports the Google Cloud client library
/*const {Translate} = require('@google-cloud/translate').v2;

// Creates a client
const translate = new Translate();

 */

/**
 * TODO(developer): Uncomment the following lines before running the sample.
 */
/*const text = data;
const target = 'es';
var tdata = '';

/*async function myTranslateFn(text){
//   var res = await translate.translate(text, {from: 'en', to: 'ja'}); 
   //return res.text;
//}

//var result = myTranslateFn("flower");
//console.log($result);


async function translateText() {
  // Translates the text into the target language. "text" can be a string for
  // translating a single piece of text, or an array of strings for translating
  // multiple texts.
  let [translations] = await translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log('Translations:');
  translations.forEach((translation, i) => {
    //console.log(`${translation}`);
tdata = tdata + translations[0];

  });
}

/*translateText().then(() => {
  //console.log(result[0]);
  console.log(tdata);
res.write('file uploaded!'+ tdata);
res.end();
});*/

//console.log('file uploaded!'+ tdata);
//res.write('file uploaded!'+ data);
//res.write('file uploaded!'+ tdata);
  res.write(data);
res.end();
          

  // sphinx-doc: js_ref_inference_stop
  const inference_stop = process.hrtime(inference_start);
  console.error('Inference took %ds for %ds audio file.', totalTime(inference_stop), audioLength.toPrecision(4));
  Ds.FreeModel(model);

});

});


    });
  } else {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<form action="upload" method="post" enctype="multipart/form-data">');
    res.write('Files: <input type="file" name="uploads" multiple="multiple"><br />');
    res.write('Upload path: <input type="text" name="path" value=""><br />');
    if (token) {
      res.write('Token: <input type="text" name="token" value=""><br />');
    }
    res.write('<input type="submit" value="Upload!">');
    res.write('</form>');
    return res.end();
  }
}).listen(port, () => {
  console.log(`http server listening on port ${port}`);
  console.log('upload target dir is', uploadDir);
});
