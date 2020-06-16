# deepspeechnode
deepspeech with nodejs upload server
Please download deepspeech-models file to the project direcoty.

## Requirements
node, npm, sox

### Download pre-trained English model files
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.pbmm

curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/deepspeech-0.7.3-models.scorer

You may download sample audio file for test.
#### Download example audio files
curl -LO https://github.com/mozilla/DeepSpeech/releases/download/v0.7.3/audio-0.7.3.tar.gz

tar xvf audio-0.7.3.tar.gz

## RUN
node http-server-upload.js
