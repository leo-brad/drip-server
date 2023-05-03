import EventEmitter from 'events';
import EventSchedule from '~/class/EventSchedule';

function configExec(config, options, projectPath) {
  process.chdir(projectPath);
  const emitter = new EventEmitter();
  new EventSchedule(emitter, config, options).start();
}

export default configExec;
