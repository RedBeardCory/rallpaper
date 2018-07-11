#! /usr/bin/env node

let args = process.argv.slice(2);


class Command {
    constructor(args) {
        let flags = [];
        let params = [];
        let vals = {};

        args.forEach((arg, index) => {
            if (arg[0] === '-') {
                if (arg[1] === '-') {
                    console.log('arg: ' + arg);
                    let v = arg.split('=');
                    vals[v[0]] = v[1];
                } else {
                    flags.push(arg);
                }
            } else {
                params.push(arg);
            }
        });

        this.flags = flags;
        this.params = params;
        this.vals = vals;
    }

    print() {
        console.log('FLAGS:');
        if (this.flags.constructor === Array) {
            this.flags.forEach((flag, index) => {
                console.log(flag);
            })
        } else {
            console.log(this.flags);
        }
        console.log('PARAMS:');
        if (this.params.constructor === Array) {
            this.params.forEach((param, index) => {
                console.log(param);
            })
        } else {
            console.log(this.params);
        }
        console.log(require('util').inspect(this.vals, { depth: null }));
    }
}

let c = new Command(args);

c.print();
