window.onload = main;
function main() {
  // 캔버스 엘리먼트 가져오기
  var canvasEl = document.getElementById('canvas');
  var ctx = canvasEl.getContext('2d');
  // 캔버스 배경색
  var backgroundColor = '#000';

  // 캔버스 너비를 뷰포트 너비와 같게 설정
  canvasEl.width = canvasEl.clientWidth;
  // 캔버스 높이를 뷰포트 높이와 같게 설정
  canvasEl.height = canvasEl.clientHeight;

  var raindropCount = 0;
  var hp = getParameterByName('hp')?getParameterByName('hp'):100;
  
  const img = new Image();
  img.src = "./umbrella.png"

  let start = Date.now();
  let seconds;
  let minutes;
  // 작은 물방울을 저장하는 배열
  // 비가 떨어지면 작은 물방울로 분해되며 이것들은 아크(원호)로 표현됩니다.
  var dropList = [];

  // 중력
  // 비가 떨어진 후에는 물방울이 떨어지기 전에 일시적으로 상승하는데, 주로 'gravity' 변수에 의해 제어됩니다.
  var gravity = 0.5;

  // 비 저장 배열
  // 각 비방울은 선으로 그려집니다.
  var linelist = [];

  // 마우스 좌표 저장
  // mousePos[0]은 x축 값을 나타내고, mousePos[1]은 y축 값을 나타냅니다.
  var mousePos = [0, canvasEl.height];

  // 마우스를 따라가면, mouseDis 범위 내에서 비방울이 흩어져 사라지고 작은 물방울로 형성됩니다.
  // mousePos를 중심으로하고 mouseDis를 반경으로 사용하여 이 범위 내의 비방울이 흩어지고 여러 작은 물방울로 형성됩니다.
  var mouseDis = getParameterByName("radius")?getParameterByName("radius"):35;

  // 애니메이션을 업데이트할 때 한 번 호출하여 'lineNum' 개의 비방울을 그립니다. 'lineNum' 값이 높을수록 비가 더 밀집됩니다.
  var lineNum = getParameterByName("level")?getParameterByName("level"):5;

  // 마우스 이동에 따라 비가 방향이 변경되는 속도를 조절합니다.
  // 마우스 이동 후 비 방향이 서서히 변경되며 주로 'speedx' 변수로 제어됩니다.
  var speedx = 0;

  // 'maxspeedx'는 'speedx'가 취할 수 있는 최대값을 나타냅니다.
  // 'speedx = maxspeedx'일 때 비 방향은 즉시 마우스 이동 방향과 변경됩니다.
  var maxspeedx = 0;

  // 페이지 크기가 변경될 때 캔버스 크기를 재설정합니다.
  window.onresize = function () {
    canvasEl.width = canvasEl.clientWidth;
    canvasEl.height = canvasEl.clientHeight;
  }

  // 마우스 이동 이벤트를 트리거합니다.
  window.onmousemove = function (e) {
    // 'mousePos'를 마우스 좌표로 설정합니다.
    // 'e.clientX'는 브라우저 창의 뷰포트 왼쪽에서의 거리를 나타냅니다.
    // 'e.clientY'는 브라우저 창의 뷰포트 위쪽에서의 거리를 나타냅니다.
    mousePos[0] = e.clientX;
    mousePos[1] = e.clientY;

    // 마우스 위치를 기반으로 'maxspeedx'의 값을 설정합니다. 범위는 -1에서 1까지입니다.
    // 'maxspeedx' 값은 다음과 관련이 있습니다:
    // 1. 비방향
    // 2. 비 떨어짐 방향
    // 3. 비 떨어짐 방향이 마우스 이동 방향을 따라 변하는 속도
    // 4. 작은 물방울의 이동 방향
    // 1에 가까운 값은 방향이 오른쪽을 향하고,
    // -1에 가까운 값은 방향이 왼쪽을 향합니다.
    maxspeedx = (e.clientX - canvasEl.clientWidth / 2) / (canvasEl.clientWidth / 2);
  }

  // 매개 변수를 기반으로 RGB 색상을 반환하는 함수
  function getRgb(r, g, b) {
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  // 비방울(선)을 그립니다.
  function createLine(e) {
    // 비방울의 길이를 무작위로 생성합니다.
    var temp = 0.25 * (50 + Math.random() * 100);
    // 비방울을 나타내는 'line' 객체
    var line = {
      // 비방울의 하강 속도
      speed: 5.5 * (Math.random() * 6 + 3),
      // 삭제 여부를 확인하는 플래그
      die: false,
      // 비방울의 x 좌표
      posx: e,
      // 비방울의 y 좌표
      posy: -50,
      // 비방울의 길이
      h: temp,
      // 비방울의 색상
      color: getRgb(Math.floor(temp * 255 / 75), Math.floor(temp * 255 / 75), Math.floor(temp * 255 / 75))
    };
    // 생성한 'line' (비방울) 객체를 저장된 비방울 배열에 추가합니다.
    linelist.push(line);
  }

  // 비방울이 흩어져 작은 물방울(아크)을 그립니다.
  function createDrop(x, y) {
    // 아크를 나타내는 'drop' 객체
    var drop = {
      // 삭제 여부를 확인하는 플래그
      die: false,
      // 아크의 중심 x 좌표
      posx: x,
      // 아크의 중심 y 좌표
      posy: y,
      // vx는 x 축 값의 변화 속도를 나타냅니다.
      vx: (Math.random() - 0.5) * 8,
      // vy는 y 축 값의 변화 속도를 나타냅니다. 범위는 -3에서 -9까지입니다.
      vy: Math.random() * (-6) - 3,
      // 아크의 반지름
      radius: Math.random() * 1.5 + 1
    };
    return drop;
  }

  // 일정 수의 작은 물방울을 그립니다.
  function madedrops(x, y) {
    // 무작위 수 'maxi' 생성
    // 'maxi'는 작은 물방울을 그릴 개수를 나타냅니다.
    var maxi = Math.floor(Math.random() * 5 + 5);
    for (var i = 0; i < maxi; i++) {
      dropList.push(createDrop(x, y));
    }
  }

  // 'update' 함수를 호출하여 애니메이션을 시작합니다.
  window.requestAnimationFrame(update);
  // 애니메이션 업데이트 함수
  function update() {
    // 저장된 작은 물방울 배열에 내용이 있다면
    if (dropList.length > 0) {
      // 저장된 작은 물방울 배열을 반복 처리합니다.
      dropList.forEach(function (e) {
        // 'e.vx'를 설정합니다. 'vx'는 x 좌표 변화 속도를 나타냅니다.
        // (speedx) / 2는 작은 물방울이 x 축으로 이동하는 거리를 짧게 만들어 더 현실적으로 보이도록 합니다.
        // 또한 작은 물방울의 이동 방향이 비 방향, 비가 떨어지는 방향, 마우스 이동 방향과 일치하도록 합니다.
        e.vx = e.vx + (speedx / 2);
        e.posx = e.posx + e.vx;

        // 'e.vy'를 설정합니다. 'vy'는 y 좌표 변화 속도를 나타냅니다.
        // 'e.vy'의 범위는 -3에서 -9이며 이 때 'e.posy'(y 좌표)는 양수입니다. 그래서 'e.posy'의 값은 먼저 감소한 다음 증가합니다.
        // 이로써 비방울이 작은 물방울로 분해되면 작은 물방울이 먼저 상승한 다음 하강하는 효과를 구현합니다.
        e.vy = e.vy + gravity;
        e.posy = e.posy + e.vy;

        // 작은 물방울의 y 좌표가 뷰포트의 높이보다 크면 'die' 속성을 true로 설정합니다.
        // 작은 물방울이 뷰포트를 벗어나면 삭제됩니다.
        if (e.posy > canvasEl.clientHeight) {
          e.die = true;
        }
      });
    }

    // 'die' 속성이 true인 배열 항목을 삭제합니다.
    // 마우스 영역을 벗어난 작은 물방울을 삭제합니다.
    for (var i = dropList.length - 1; i >= 0; i--) {
      if (dropList[i].die) {
        dropList.splice(i, 1);
      }
    }

    // 비 방향 변경 속도를 설정합니다. 범위: -1에서 1
    // 'speedx = maxspeedx'일 때 비 방향이 마우스 이동 방향과 즉시 변경됩니다.
    speedx = speedx + (maxspeedx - speedx) / 50;

    // 'lineNum' 값을 기반으로 일정 수의 비방울을 그립니다.
    for (var i = 0; i < lineNum; i++) {
      // 비방울의 x 좌표를 매개 변수로 사용하여 'createLine' 함수를 호출합니다.
      createLine(Math.random() * 2 * canvasEl.width - (0.5 * canvasEl.width));
    }

    // 종료 라인을 설정합니다. 비방울이 흩어져 작은 물방울로 형성되는 위치입니다.
    // var endLine = canvasEl.clientHeight - Math.random() * canvasEl.clientHeight / 5;
    var endLine = canvasEl.clientHeight;
    // console.log(endLine);

    // 저장된 비방울 배열을 반복 처리합니다.
    linelist.forEach(function (e) {

      // 피타고라스 정리를 사용하여 비방울이 흩어져 작은 물방울로 형성되는 범위를 결정합니다.
      // 'e.posx + speedx * e.h'는 비방울의 x 좌표입니다.
      // 'e.posy + e.h'는 비방울의 y 좌표입니다.
      var dis = Math.sqrt(((e.posx + speedx * e.h) - mousePos[0]) * ((e.posx + speedx * e.h) - mousePos[0]) + (e.posy + e.h - mousePos[1]) * (e.posy + e.h - mousePos[1]));

      // 'mouseDis' 범위 내에 있다면 비방울을 삭제하고 작은 물방울(아크)을 그립니다.
      // 마우스가 비에 닿으면 비가 작은 물방울로 흩어지는 효과를 구현합니다.
      if (dis < mouseDis) {
        raindropCount++;
        hp--;
        // console.log(raindropCount, hp);
        // 비방울 삭제
        e.die = true;
        // 작은 물방울(아크) 몇 개를 그립니다.
        madedrops(e.posx + speedx * e.h, e.posy + e.h);
      }

      // 비방울이 종료 라인을 초과하면 비방울을 삭제하고 작은 물방울(아크)을 그립니다.
      if ((e.posy + e.h) > endLine) {
        e.die = true;
        madedrops(e.posx + speedx * e.h, e.posy + e.h);
      }

      // 비방울 y 좌표가 뷰포트 높이보다 크거나 같으면 'die' 속성을 true로 설정합니다.
      // 비방울이 뷰포트를 벗어나면 삭제됩니다.
      if (e.posy >= canvasEl.clientHeight) {
        e.die = true;
      } else {
        // 비방울 y 좌표를 점차 증가시킵니다.
        e.posy = e.posy + e.speed;

        // 비방향 변경
        // * speedx는 비방향을 제어하는 데 사용됩니다.
        // 비방향의 이동 방향이 마우스 이동 방향과 일치하도록 합니다.
        e.posx = e.posx + e.speed * speedx;
      }
    });

    // 'die' 속성이 true인 배열 항목을 삭제합니다.
    // 마우스 영역을 벗어난, 종료 라인을 초과한 비방울을 삭제합니다.
    for (var i = linelist.length - 1; i >= 0; i--) {
      if (linelist[i].die) {
        linelist.splice(i, 1);
      }
    }

    // 렌더링
    render();
    if(hp <= 0) {
      return;
    }
    // 애니메이션 효과를 구현하기 위해 'update'를 재귀적으로 호출합니다.
    window.requestAnimationFrame(update);
  }

  // 렌더링
  function render() {
    // 뷰포트와 같은 크기의 사각형 그리기
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);

    // 비 효과 그리기
    ctx.lineWidth = 5;
    linelist.forEach(function (line) {
      ctx.strokeStyle = line.color;
      ctx.beginPath();
      ctx.moveTo(line.posx, line.posy);

      // * speedx를 사용하여 비 방향 제어
      // 비 방향이 마우스 이동 방향과 일치하도록 합니다.
      ctx.lineTo(line.posx + line.h * speedx, line.posy + line.h);
      ctx.stroke();
    });

    // 비가 흩어져 작은 물방울로 형성되는 효과 그리기
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#fff";
    dropList.forEach(function (e) {
      ctx.beginPath();
      ctx.arc(e.posx, e.posy, e.radius, Math.random() * Math.PI * 2, 1 * Math.PI);
      ctx.stroke();
    });

    // 주석 해제하면 마우스 범위가 표시됩니다.
    ctx.beginPath();
    ctx.arc(mousePos[0], mousePos[1], mouseDis, 0, 2 * Math.PI);
    ctx.strokeStyle = getParameterByName("umbrella")?`#${getParameterByName("umbrella")}`:"#FFFFFF30";
    ctx.stroke();
    if(!getParameterByName("umbrella")){
      ctx.drawImage(img, mousePos[0]-48, mousePos[1]-48, 96, 96)
    }

    ctx.font ="30pt Fira";
    ctx.fillStyle = hp < 80? (hp < 40?"rgb(255,100,100)":"rgb(255, 255, 100)"):"rgb(255, 255, 255)";
    // ctx.fillStyle = "rgb(255, 255, 100)";
    ctx.fillText(`HP: ${Math.floor(hp)}`, 50, 150);

    seconds = Math.floor((Date.now()-start)/1000);
    minutes = Math.floor(seconds/60);
    seconds%=60;
    ctx.font ="30pt Fira";
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillText(`Timer: ${minutes.toString().padStart(2,"0")+":"+seconds.toString().padStart(2,"0")}`,50,100);
  }
}

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}