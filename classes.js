// nuclear graphic objects
class Nuc {
  constructor() {
    this.graphic = new PIXI.Graphics();
  }
}

// grapic line object
class Line extends Nuc {
  constructor(startX, startY, endX, endY, col, wid, alp = 1.0) {
    super();
    // style of line
    this.graphic.lineStyle(wid, col, alp); 
    // compute middle point at set as position and pivot
    let mid_arr = [(startX + endX)/2, (startY + endY)/2]
    this.graphic.position =  {x: mid_arr[0], y: mid_arr[1]};
    // set starting and end coordinate
    this.graphic.moveTo(startX - mid_arr[0], startY - mid_arr[1]);
    this.graphic.lineTo(endX - mid_arr[0], endY - mid_arr[1]);
  }
}

// group of containers
class grpEle {
  constructor(elements, timeX = 1.0, dir = [1,0], t = 0) {
    // put graphics object into container
    this.elements = elements
    this.container = new PIXI.Container();
    for (let i = 0; i < this.elements.length; i++) {
      const ele = this.elements[i]
      if ('graphic' in ele) {
        this.container.addChild(this.elements[i].graphic);
      } else {
        this.container.addChild(this.elements[i].container);
      }   
    }
    this.speed = computeSpeed(timeX); // speed of movement
    this.dir = normalizeDir(dir); // normalized direction of movement
    this.refT = t // reference time 
  }

  shift(x,y) {
    this.container.x += x;
    this.container.y += y;
  }

  move(t) {
    this.shift(t * this.dir[0] * this.speed, t * this.dir[1] * this.speed)
  }

  changeSpeed(timeX) {
    this.speed = computeSpeed(timeX);
  }

  setDir(dir) {
    this.dir = normalizeDir(dir);
  }

  reverseDir() {
    this.dir = this.dir .map(x => x * -1)  
  }

  mirror(p1_arr,p2_arr) { // container, first point of line, second points of line
    this.container.children.forEach(child => {
      const mirP_arr = mirrorPoint(pDicToArr(child.getGlobalPosition()), p1_arr, p2_arr);
      child.x = this.container.x + mirP_arr[0]
      child.y = this.container.y + mirP_arr[1]
    });
  }

}

// manages active containers
class stageManager {
  constructor(elements, active = []) {
    this.elements = elements
    this.active = active;
    // add active elements to stage
    for (let i = 0; i < this.active.length; i++) {
      app.stage.addChild(this.elements[this.active[i]].container)
    }
  }

  // de-activate elements in array
  deactivate(deact) {
    // update array attribute
    this.active = this.active.filter(i => !deact.includes(i))
    // remove from stage
    for (let i = 0; i < deact.length; i++) {
      app.stage.removeChild(this.elements[deact[i]].container)
    }
  }

  // activate the next element 
  activateNext() {
    // get next element to activate
    const maxAct_int = (!this.active.length) ? 0 : Math.max(...this.active)
    if (maxAct_int < (this.elements.length - 1)) {
      var nextAct_int = maxAct_int + 1
    } else {
      var nextAct_int = 0
    }

    // activate if not activated yet
    if (!this.active.includes(nextAct_int)) {
      // add to array
      this.active.push(nextAct_int);
      // add to stage
      app.stage.addChild(this.elements[nextAct_int].container)
      return nextAct_int
    }
  }
}

class interTracker {
  constructor(tsInter_arr) {
    this.inter = tsInter_arr
    this.pass = new Array(tsInter_arr.length).fill(0.0);
  }

  // update time-tracking
  updateTracker(t) { // passed time in seconds
    // update array of passed time
    this.pass = this.pass.map((i) => i + t);
    var reSet_arr = new Array(this.inter.length).fill(false);
    // check if passed time exceeds interval
    for (let i = 0; i < this.inter.length; i++) {
      
      if (this.inter[i] < this.pass[i]) {
        this.pass[i] = this.inter[i] - this.pass[i]
        reSet_arr[i] = true
      }
    }
    return reSet_arr
  }

  // get passed share of intervall
  passedInter(i) {
    return this.pass[i] / this.inter[i]
  }
}