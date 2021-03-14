const nodeunicornhathd = require('unicornhat-hd');
const admin = require('firebase-admin');
const hatHD = new nodeunicornhathd('/dev/spidev0.0');
const serviceAccount = require('./pi-image-bb118.json');
const fetch = require('node-fetch');
const getPixels = require('get-pixels');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const showImageFromData = (data, width, height) => {
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      const idx = (width * y + x) << 2; 
      hatHD.setPixel(x, y, data[idx], data[idx + 1], data[idx + 2]);
    }
  }
  hatHD.show();
};

const db = admin.firestore();
const imgRef = db.collection('img').doc('singleDisplay');
const observer = imgRef.onSnapshot(async docSnapshot => {
  const imgUrl = docSnapshot.get('imgUrl');
  if (!imgUrl) {
    console.log('No Image URL Found');
    return;
  }
  console.log(`Getting image data: ${imgUrl}`);
  getPixels(imgUrl, (err, pixels) => {
    console.log('Show image');
    showImageFromData(pixels.data, pixels.shape[0], pixels.shape[1]);
  });
}, err => {
  console.log(err);
})
