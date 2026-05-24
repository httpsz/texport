/**
 * 影エフェクト
 */

window.EFFECT_shadow = {
  id: 'shadow',
  label: '影',

  params: [
    { id: 'color',   label: '色',    type: 'color',  default: '#000000' },
    { id: 'alpha',   label: '透明度', type: 'range',  min: 0, max: 1, step: 0.01, default: 0.6 },
    { id: 'offsetX', label: 'X方向',  type: 'number', min: -100, max: 100, default: 4 },
    { id: 'offsetY', label: 'Y方向',  type: 'number', min: -100, max: 100, default: 4 },
    { id: 'blur',    label: 'ぼかし', type: 'number', min: 0, max: 80, default: 6 },
  ],

  apply(ctx, lines, p, layout) {
    const { font, lineHeight, padding, align, vertical, size } = layout;

    const hex = p.color.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    const shadowColor = `rgba(${r},${g},${b},${p.alpha})`;

    ctx.save();
    ctx.font = font;
    ctx.fillStyle = shadowColor;
    ctx.shadowColor = 'transparent';

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
          ctx.fillText(chars[i], x - size / 2 + p.offsetX, startY + i * lineHeight + p.offsetY);
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
        ctx.fillText(lines[i], x + p.offsetX, padding + i * lineHeight + p.offsetY);
      }
    }

    ctx.restore();
  }
};
