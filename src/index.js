import configExec from '~/lib/configExec';
import parseOption from '~/lib/parseOption';

const [_1, _2, configString, projectPath, ...rest] = process.argv;
const config = JSON.parse(configString);
const options = parseOption(...rest);
configExec(config, options, projectPath);
