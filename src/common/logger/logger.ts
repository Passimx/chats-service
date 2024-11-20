const endColor = '\x1B[0m'; // ansi color escape codes
const infoColor = '\x1B[34m';
const errorColor = '\x1B[31m';
const debugColor = '\x1B[33m';

const log = (level: string, msg: unknown) => {
    let prefix = `${infoColor}info:${endColor}`;

    switch (level) {
        case 'error':
            prefix = `${errorColor}error:${endColor}`;
            break;
        case 'debug':
            prefix = `${debugColor}debug:${endColor}`;
            break;
    }

    // eslint-disable-next-line no-console
    console.log(prefix, msg);
};

export const logger = {
    info: (message: unknown) => log('info', message),
    error: (message: unknown) => log('error', message),
    debug: (message: unknown) => log('debug', message),
};
