#! /usr/bin/env node

const fetch = require('node-fetch');
const fs = require('fs');
const os = require('os');
const wallpaper = require('wallpaper');

let flags = [];
let params = [];
let vals = {};

let ruhro = `
    rallpaper, sets a random wallpaper from NASA's image API

    Usage:
        $ rallpaper [flags] [opts]

    Opts:

        --search=[terms]

            Enter in search terms to search NASA's library of images.
            --search=sr-71

        --file="[FILENAME]"

            Enter in the save location for the image
            --file="/home/redbeard/coolestWallpaperEva"
            Defaults to the current path + 'rallpaper'
            The file type will change depending on what is downloaded

        --scale=[fit|stretch|fill|center]
            The way the image will be scaled to your desktop

    Flags:

        -h
            Brings up this helpful little message

        -d
            Development mode, shows some maybe useful stuff about the response from NASA

        -i
            Brings up a little info about the image you now have as your background
`;

function run() {
    let args = process.argv.slice(2);
    let fType = 'jpg';
    args.forEach((arg, index) => {
        if (arg[0] === '-') {
            if (arg[1] === '-') {
                let v = arg.split('=');
                vals[v[0]] = v[1];
            } else {
                flags.push(arg);
            }
        } else {
            params.push(arg);
        }
    });

    if (flags) {
        flags.forEach(function(flag, index) {
            switch (flag) {
                case "-h":
                    console.log(ruhro);
                    process.exit();
                    break;
                case "-i":
                    prettyPrintInfo();
                    process.exit();
                    break;
                case "-d":
                    debug();
                    break;
                default:
                    console.log('Unknown flag');
            }
        })
    }

    flags.includes('-d') && console.log('https://images-api.nasa.gov/search?' + ((vals['--search']) ? 'q=' + vals['--search'] : 'q=sr-71') + '&media_type=image');

    fetch('https://images-api.nasa.gov/search?' + ((vals['--search']) ? 'q=' + vals['--search'] : 'q=sr-71') + '&media_type=image')
    .then(res => res.json())
    .then(res => {
        // select random image
        let random = res.collection.items[Math.floor(Math.random() * res.collection.items.length)];

        // save information about it

        // dev info
        flags.includes('-d') && console.log(require('util').inspect(random.href, { depth: null }));

        // get image links
        return fetch(random.href);
    })
    .then(res => res.json())
    .then(res => {

        // dev info
        flags.includes('-d') && console.log(require('util').inspect(res, { depth: null }));

        // set the filetype
        let parts = res[0].split('.');
        fType = parts[parts.length -1];

        // get the image itself
        return fetch(res[0]);
    })
    .then(res => {
        // saves the image
        return new Promise((resolve, reject) => {
            const dest = fs.createWriteStream(((vals['--file']) ? vals['--file'] : 'rallpaper') + '.' + fType);
            res.body.pipe(dest);
            let size = res.headers.get('content-length'); // in bytes
            let current = 0;
            res.body.on('error', err => {
                reject(err);
            });
            res.body.on('data', chunk => {
                current += chunk.length;
                process.stdout.write(current + "/" + size + " bytes\r");
            });
            res.body.on('end', () => {
                process.stdout.write(current + "/" + size + " bytes ... Download complete\n");
            });
            dest.on('finish', () => {
                resolve();
            });
            dest.on('error', err => {
                reject(err);
            });
        });
    })
    .then(() => {
        // set new wallpaper here
        wallpaper.set(((vals['--file']) ? vals['--file'] : 'rallpaper') + '.' + fType, {'scale': 'fit'})
        .catch(e => {
            process.stdout.write("error setting wallpaper: \n" + e);
        });
    })
    .catch(e => {
        console.log(e);
    });
}

function prettyPrintInfo() {
    console.log('REEEEEEEEEEEEEEE');
}

function debug() {
    console.log('FLAGS:');
    if (flags.constructor === Array) {
        flags.forEach((flag, index) => {
            console.log(flag);
        })
    } else {
        console.log(flags);
    }
    console.log('PARAMS:');
    if (params.constructor === Array) {
        params.forEach((param, index) => {
            console.log(param);
        })
    } else {
        console.log(params);
    }
    console.log('VALS:');
    console.log(require('util').inspect(vals, { depth: null }));
}

// start the command
run();
