import path from 'path';
import net from 'net';
import os from 'os';
import Instance from '~/class/Instance';
import InstanceCache from '~/class/InstanceCache';
import InstanceIndex from '~/class/InstanceIndex';
import WatchPath from '~/class/WatchPath';
import getPoolSize from '~/lib/getPoolSize';
import ProcPool from '~/class/ProcPool';
import getPackages from '~/lib/package';

class EventSchedule {
  constructor(emitter, config, options) {
    this.pool = [];
    this.config = config;
    this.emitter = emitter;
    this.options = options;
    this.ii = new InstanceIndex(2);
    this.ic = new InstanceCache();
    this.size = getPoolSize(config);
    this.wp = new WatchPath(emitter, config);
  }

  start() {
    this.initSocket();
  }

  schedule() {
    this.sendPackages();
    this.bindEvent();
    this.wp.start();
    this.fillProcPool();
  }

  writeData(data) {
    this.socket.write(JSON.stringify(data), 'utf-8');
  }

  initSocket() {
    const server = net.createServer((socket) => {
      const { config, emitter, } = this;
      this.pps = new Instance(config, emitter, socket).getPriProcs();
      this.socket = socket;
      this.schedule();
    });
    const {
      options,
    } = this;
    server.listen(options.p || options.port);
  }

  sendPackages() {
    const plugins = getPackages();
    const event = 'pkg';
    this.writeData([event, plugins]);
  }

  fillProcPool(location) {
    this.pp = new ProcPool(this.size);
    const { pps, pp, } = this;
    pps.forEach(({ pri, proc, }) => pp.addPriProc(pri, proc));
    pp.updatePool();
    this.pool = pp.getPool().map((proc) => proc.start());
  }

  cleanProcPool() {
    const { pool, } = this;
    pool.forEach((e) => {
      e.getProc().kill(2);
    });
    const event = 'restart';
  }

  checkFreeMemory() {
    const {
      core: {
        minMem,
      },
    } = this.config;
    let ans = true;
    if (os.freemem() / 1024 ** 2 > minMem) {
      ans = false;
    }
    return ans;
  }

  bindEvent() {
    const { emitter, socket, } = this;
    emitter.on('file', (eventType, location) => {
      if (
        /^\.drip\/local\/instance\/\[(\w+)\]:(\w+)$/
        .test(path.relative('.', location))
      ) {
        const { ii, } = this;
        ii.indexInstance(location);
      } else {
        this.cleanProcPool();
        this.fillProcPool(location);
      }
    });
    emitter.on('proc', async ({ field, instance, data='', }) => {
      const event = 'proc';
      switch (field) {
        case 'end':
          break;
      }
      this.writeData([event, instance, field, data,]);
    });
  }
}

export default EventSchedule;
