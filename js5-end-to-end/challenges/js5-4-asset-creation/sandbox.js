const fs = require('fs');

// const readFilePromise = (filename) => {
//     return new Promise((resolve, reject) => {
//         fs.readFile(`./files/${filename}`, {encoding: 'utf8'}, (err, data) => {
//             if (err) {
//                 console.log('some shit happened ')
//                 reject(`Error reading file: ${err}`);
//             }
//             resolve(data);
//         });
//     });
// };

const read = async () => {
    console.log('start');
    const data = await await fs.promises.readFile('./files/testytest.js', 'utf8');
    console.log(data);
};

read();
