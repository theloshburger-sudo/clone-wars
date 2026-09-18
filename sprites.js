(function () {
  function drawBackground(ctx, width, height, time) {
    ctx.save();

    const sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, '#6f2b28');
    sky.addColorStop(0.55, '#b95736');
    sky.addColorStop(1, '#e18b4f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    const sunX = width * 0.76 + Math.sin(time * 0.08) * 6;
    const sunY = height * 0.2;
    ctx.fillStyle = 'rgba(255, 211, 116, 0.75)';
    ctx.beginPath();
    ctx.arc(sunX, sunY, Math.max(28, width * 0.1), 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#80382e';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.46);
    ctx.lineTo(width * 0.16, height * 0.32);
    ctx.lineTo(width * 0.31, height * 0.45);
    ctx.lineTo(width * 0.48, height * 0.28);
    ctx.lineTo(width * 0.67, height * 0.43);
    ctx.lineTo(width * 0.84, height * 0.3);
    ctx.lineTo(width, height * 0.43);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#5b2828';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.62);
    ctx.lineTo(width * 0.11, height * 0.5);
    ctx.lineTo(width * 0.24, height * 0.64);
    ctx.lineTo(width * 0.39, height * 0.49);
    ctx.lineTo(width * 0.53, height * 0.64);
    ctx.lineTo(width * 0.72, height * 0.5);
    ctx.lineTo(width, height * 0.62);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function drawGround(ctx, width, height, groundHeight, offset) {
    ctx.save();
    const top = height - groundHeight;
    ctx.fillStyle = '#3e2425';
    ctx.fillRect(0, top, width, groundHeight);

    ctx.fillStyle = '#9b5036';
    ctx.fillRect(0, top, width, 7);

    const tile = 42;
    const shift = ((offset % tile) + tile) % tile;
    ctx.fillStyle = '#67302d';
    for (let x = -shift - tile; x < width + tile; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, top + 12);
      ctx.lineTo(x + tile * 0.72, top + 12);
      ctx.lineTo(x + tile * 0.5, height);
      ctx.lineTo(x - tile * 0.22, height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawBird(ctx, x, y, size, velocity) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.max(-0.28, Math.min(0.32, velocity / 900)));

    const s = size / 34;
    ctx.scale(s, s);

    ctx.fillStyle = '#d7d9d2';
    ctx.strokeStyle = '#211b20';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-16, -8);
    ctx.lineTo(-5, -13);
    ctx.lineTo(12, -10);
    ctx.lineTo(16, -3);
    ctx.lineTo(12, 8);
    ctx.lineTo(-7, 12);
    ctx.lineTo(-16, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#8d9b9b';
    ctx.beginPath();
    ctx.moveTo(-15, -7);
    ctx.lineTo(-21, -12);
    ctx.lineTo(-18, -2);
    ctx.lineTo(-21, 8);
    ctx.lineTo(-10, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#d56b3f';
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(18, -3);
    ctx.lineTo(8, 1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2f5057';
    ctx.fillRect(-1, -8, 8, 5);
    ctx.strokeRect(-1, -8, 8, 5);
    ctx.fillStyle = '#efb64f';
    ctx.fillRect(-11, 6, 6, 3);

    ctx.restore();
  }

  function drawPipe(ctx, x, gapTop, gapBottom, pipeWidth, height) {
    ctx.save();
    const capHeight = Math.min(14, pipeWidth * 0.24);
    const capInset = Math.min(4, pipeWidth * 0.08);
    const bodyX = x + capInset;
    const bodyWidth = pipeWidth - capInset * 2;

    function rockColumn(top, bottom, capY) {
      ctx.fillStyle = '#6b302b';
      ctx.fillRect(bodyX, top, bodyWidth, bottom - top);
      ctx.fillStyle = '#a64c35';
      ctx.fillRect(bodyX + 4, top, Math.max(3, bodyWidth * 0.22), bottom - top);
      ctx.fillStyle = '#3a2025';
      ctx.fillRect(x, capY, pipeWidth, capHeight);
      ctx.fillStyle = '#c0663e';
      ctx.fillRect(x + capInset, capY + 3, pipeWidth - capInset * 2, 3);
    }

    rockColumn(0, gapTop, gapTop - capHeight);
    rockColumn(gapBottom, height, gapBottom);

    ctx.restore();
  }

  window.SPRITES = { drawBackground, drawGround, drawBird, drawPipe };
})();
