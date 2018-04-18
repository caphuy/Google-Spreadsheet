const x = require('./app');

x.readSpreadsheet().then(data => {
  console.log(data);
})