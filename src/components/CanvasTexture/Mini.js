/* eslint-disable */
export class Mini {
  constructor({ name, window, domElement }) {
    this.resource = new Map();
    this.get = (k) => {
      return new Promise((resolve) => {
        let ttt = 0;
        ttt = setInterval(() => {
          if (this.resource.has(k)) {
            clearInterval(ttt);
            resolve(this.resource.get(k));
          }
        });
      });
    };
    this.set = (k, v) => {
      this.resource.set(k, v);
    };
    this.name = name;
    this.domElement = domElement;
    this.getRect = () => {
      return domElement.getBoundingClientRect();
    };
    let isAborted = false;
    this.tasks = [];
    this.resizeTasks = [];
    this.cleanTasks = [];
    this.onLoop = (fnc, num = 0) => {
      if (num >= 0) {
        this.tasks.push(fnc);
      } else {
        this.tasks.unshift(fnc);
      }
    };

    this.onResize = (fnc) => {
      fnc();
      this.resizeTasks.push(fnc);
    };

    this.onClean = (func) => {
      this.cleanTasks.push(func);
    };

    let intv = 0;
    let internalResize = () => {
      clearTimeout(intv);
      intv = setTimeout(() => {
        this.resizeTasks.forEach((e) => e());
      }, 16.8888);
    };

    window.addEventListener("resize", () => {
      internalResize();
    });

    let isPaused = false;
    this.toggle = () => {
      isPaused = !isPaused;
    };
    this.pause = () => {
      isPaused = true;
    };
    this.play = () => {
      isPaused = false;
    };

    this.clean = () => {
      isAborted = true;
      try {
        this.cleanTasks.forEach((e) => e());
      } catch (e) {
        console.error(e);
      }
    };

    this.work = () => {
      if (isAborted) {
        return {
          name: this.name,
          duration: 0,
        };
      }
      if (isPaused) {
        return {
          name: this.name,
          duration: 0,
        };
      }
      let start = window.performance.now();
      try {
        this.tasks.forEach((e) => e());
      } catch (e) {
        console.error(e);
      }
      let end = window.performance.now();
      let duration = end - start;

      return {
        name: this.name,
        duration,
      };
    };

    this.ready = new Proxy(
      {},
      {
        get: (obj, key) => {
          return this.get(key);
        },
      }
    );
  }
}
