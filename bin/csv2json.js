const path = require('path');
const fse = require('fs-extra');


// process.argv.forEach(function (val, index, array) {
//   console.log(index + ': ' + val);
// });

let hymnal = process.argv[2];
console.log(hymnal)

fse.readFile('./csvuploads/SDAH.enc', 'utf8')
// .then(filecontents => {
//     return filecontents
// })
.then(filecontents => {
    console.log(filecontents)
    let data = decodeURIComponent(filecontents)
    // console.log(data)
    console.log(JSON.parse(data).songs)

    
})