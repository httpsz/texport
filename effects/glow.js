/**
 * 発光エフェクト
 */

window.EFFECT_glow = {
  id: 'glow',
  label: '発光',

  params: [
    { id: 'color',    label: '色',    type: 'color',  default: '#ffffff' },
    { id: 'alpha',    label: '透明度', type: 'range',  min: 0, max: 1, step: 0.01, default: 0.8 },
    { id: 'blur',     label: '拡散',  type: 'number', min: 1, max: 80, default: 16 },
    { id: 'strength', label: '強さ',  type: 'number', min: 1, max: 6,  default: 3 },
  ],

  apply(ctx, lines, p, layout) {
    const { font, lineHeight, padding, align, vertical, size } = layout;

    const hex = p.color.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    const glowColor = `rgba(${r},${g},${b},${p.alpha})`;

    // 発光は複数回同じ場所にblurをかけて描画することで強度を出す
    const passes = Math.round(p.strength);

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = glowColor;
    ctx.filter = `blur(${p.blur}px)`;

    for (let pass = 0; pass < passes; pass++) {
      if (vertical) {
        const colWidth = size * 1.2;
        for (let col = 0; col < lines.length; col++) {
          const chars = lines[col].split('');
          let startY;
          if (align === 'start') startY = padding;
          else if (align === 'end') startY = ctx.canvas.height - padding - chars.length * lineHeight;
          else startY = (ctx.canvas.height - chars.length * lineHeight) / 2;
          const x = ctx.canvas.width - padding - colWidth * (col + 0.5);
          for (let i = 0; i < chars.length; i++) {
            ctx.fillText(chars[i], x - size / 2, startY + i * lineHeight);
          }
        }
      } else {
        ctx.textBaseline = 'top';
        for (let i = 0; i < lines.length; i++) {
          let x;
          const metrics = ctx.measureText(lines[i]);
          if (align === 'center') x = (ctx.canvas.width - metrics.width) / 2;
          else if (align === 'right') x = ctx.canvas.width - padding - metrics.width;
          else x = padding;
          ctx.fillText(lines[i], x, padding + i * lineHeight);
        }
      }
    }

    ctx.restore();
  }
};
