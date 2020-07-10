

var DEBUG, 
astar, 
check_obstacle, 
cross_fire, 
home_is_grid, 
is_bullet_proof, 
is_wall, 
pix2block, 
preprocess_map;

preprocess_map = function (map, astar_map) {
  var color, ctx, i, j, myCanvas, score, v, _i, _j, _k, _l;

  for (i = _i = 0; _i < 25; i = _i += 1) {
    for (j = _j = 0; _j < 25; j = _j += 1) {
      score = check_obstacle(i, j);
      astar_map[i][j] = score;
    }
  }
  if (!DEBUG) {
    return;
  }
  myCanvas = document.getElementById("astar");
  ctx = myCanvas.getContext("2d");
  for (i = _k = 0; _k < 25; i = _k += 1) {
    for (j = _l = 0; _l < 25; j = _l += 1) {
      v = astar_map[i][j];
      if (v === 0) {
        color = "white";
      } else {
        color = "rgb(" + v * 20 + ",0,0)";
      }
      ctx.strokeStyle = ctx.fillStyle = color;
      ctx.fillRect(i * 16, j * 16, 16, 16);
    }
  }
};

check_obstacle = function (x, y) {
  var m, n, s, _i, _j;

  s = 1;
  for (m = _i = 0; _i < 2; m = _i += 1) {
    for (n = _j = 0; _j < 2; n = _j += 1) {
      if (map[y + n][x + m] === GRID || map[y + n][x + m] === WATER) {
        return 0;
      }
      if (is_wall(map[y + n][x + m])) {
        s = 9;
      }
    }
  }
  return s;
};

home_is_grid = function () {
  return map[23][12] === GRID;
};

pix2block = function (v) {
  return Math.round(parseFloat(v / 16));
};

Tank.prototype.think = function (amap) {
  var aux_map, i, j, p, playerx, playery, x, y, _i, _j, _k;

  aux_map = new Array(25);
  for (i = _i = 0; _i < 25; i = _i += 1) {
    aux_map[i] = new Array(25);
    for (j = _j = 0; _j < 25; j = _j += 1) {
      aux_map[i][j] = 0;
    }
  }
  x = pix2block(this.x);
  y = pix2block(this.y);
  if (home_is_grid()) {
    p = astar(x, y, pix2block(tanks[0].x), pix2block(tanks[0].y), amap, aux_map);
  } else {
    for (i = _k = 0; _k < playerNum; i = _k += 1) {
      playerx = pix2block(tanks[i].x);
      playery = pix2block(tanks[i].y);
      if (this.score === 100) {
        cross_fire(aux_map, playerx, playery, 4);
      } else if (this.score === 200) {
        cross_fire(aux_map, playerx, playery, 4);
      }
    }
    p = astar(x, y, 12, 24, amap, aux_map);
  }
  if (x === p.x && p.y === y - 1) {
    return this.dir = UP;
  } else if (x === p.x && p.y === y + 1) {
    return this.dir = DOWN;
  } else if (y === p.y && p.x === x - 1) {
    return this.dir = LEFT;
  } else if (y === p.y && p.x === x + 1) {
    return this.dir = RIGHT;
  }
};

astar = function (fromx, fromy, tox, toy, amap, aux_map) {
  var bh, cost, ctx, d, dis, flag, i, myCanvas, nx, ny, p, path, visited, _i;

  bh = new BinaryHeap(function (e) {
    return e.g + e.h;
  });
  d = [[0, 1], [1, 0], [-1, 0], [0, -1]];
  bh.push({
    x: fromx,
    y: fromy,
    g: 0,
    h: 0,
    pre: null
  });
  flag = false;
  path = [];
  i = 0;
  p = {};
  visited = 999;
  while (bh.size() !== 0) {
    p = bh.pop();
    for (i = _i = 0; _i < 4; i = _i += 1) {
      nx = p.x + d[i][0];
      ny = p.y + d[i][1];
      if (nx === tox && ny === toy) {
        flag = true;
        break;
      }
      if (nx < 0 || nx > 24 || ny < 0 || ny > 24 || amap[nx][ny] === 0) {
        continue;
      }
      dis = Math.abs(nx - tox) + Math.abs(ny - toy);
      cost = p.g + amap[nx][ny] + aux_map[nx][ny];
      if (aux_map[nx][ny] === visited) {
        continue;
      }
      bh.push({
        x: nx,
        y: ny,
        g: cost,
        h: dis,
        pre: p
      });
      aux_map[nx][ny] = visited;
    }
    if (flag) {
      path.push({
        x: tox,
        y: toy
      });
      break;
    }
  }
  while (p != null) {
    path.push(p);
    p = p.pre;
  }
  if (!DEBUG) {
    return path[path.length - 2];
  }
  myCanvas = document.getElementById("astar");
  ctx = myCanvas.getContext("2d");
  ctx.beginPath();
  ctx.strokeStyle = ctx.fillStyle = "white";
  ctx.lineWidth = 1;
  for (i in path) {
    if (i === 0) {
      ctx.moveTo(path[i].x * 16, path[i].y * 16);
    } else {
      ctx.lineTo(path[i].x * 16, path[i].y * 16);
    }
  }
  ctx.stroke();
  return path[path.length - 2];
};

is_bullet_proof = function (x, y) {
  return map[y][x] === GRID || is_wall(map[y][x]);
};

cross_fire = function (map, x, y, cost) {
  var c, m, n, v;

  v = 8;
  m = x;
  c = v;
  while (m >= 0 && !(is_bullet_proof(m, y) || is_bullet_proof(m, y + 1))) {
    if (c > 0) {
      c--;
    }
    map[m][y] += cost + c;
    m--;
  }
  m = x + 1;
  c = v;
  while (m < 25 && !(is_bullet_proof(m, y) || is_bullet_proof(m, y + 1))) {
    if (c > 0) {
      c--;
    }
    map[m][y] += cost + c;
    m++;
  }
  n = y;
  c = v;
  while (n >= 0 && !(is_bullet_proof(x, n) || is_bullet_proof(x + 1, n))) {
    if (c > 0) {
      c--;
    }
    map[x][n] += cost + c;
    n--;
  }
  n = y + 1;
  c = v;
  while (n < 25 && !(is_bullet_proof(x, n) || is_bullet_proof(x + 1, n))) {
    if (c > 0) {
      c--;
    }
    map[x][n] += cost + c;
    n++;
  }
};

is_wall = function (v) {
  return v === WALL || v === 10 || v === 11 || v === 12 || v === 13;
};

DEBUG = false;
