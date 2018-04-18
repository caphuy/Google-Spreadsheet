// const x = require('./app');

// x.readSpreadsheet().then(data => {
//   console.log(data);
// })

readline = require('readline');

function a() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (err, code) => {
      if (!err) {
        resolve(code)
      } else {
        reject(err);
      }
    });
  })
  
}

a().then(data => {
  console.log(data);
}).catch(e => {
  console.log(e);
})