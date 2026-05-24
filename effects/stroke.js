/**
 * 縁取りエフェクト
 * ---
 * 追加方法：
 * 1. このファイルをコピーして effects/ フォルダに置く
 * 2. effects-loader.js の EFFECTS_REGISTRY に登録する
 * 3. apply(ctx, lines, params, layout) を実装する
 */

window.EFFECT_stroke = {
  id: 'stroke',
  label: '縁取り',

  // UI定義: 各パラメータのコントロールを定義する
  params: [
    { id: 'color',   label: '色',    type: 'color',  default: '#000000' },
    { id: 'alpha',   label: '透明度', type: 'range',  min: 0, max: 1, step: 0.01, default: 1 },
    { id: 'width',   label: '太さ',  type: 'number', min: 1, max: 100, default: 8 },
    { id: 'blur',    label: 'ぼかし', type: 'number', min: 0, max: 50, default: 0 },
  ],

  /**
   * エフェクト適用関数
   * @param {CanvasRenderingContext2D} ctx
   * @param {string[]} lines - テキスト行配列
   * @param {object} p - パラメータ値 { color, alpha, width, blur }
   * @param {object} layout - { font, size, lineHeight, padding, align, vertical }
   */
  apply(ctx, lines, p, layout) {
    const { font, size, lineHeight, padding, align, vertical } = layout;

    // 色をrgbaに変換
    const hex = p.color.replace('#', '');
    const r = parseInt(hex.slice(0,2), 16);
    const g = parseInt(hex.slice(2,4), 16);
    const b = parseInt(hex.slice(4,6), 16);
    const strokeColor = `rgba(${r},${g},${b},${p.alpha})`;

    ctx.save();
    ctx.font = font;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = p.width * 2;
    ctx.lineJoin = 'round';
    ctx.filter = p.blur > 0 ? `blur(${p.blur}px)` : 'none';

    if (vertical) {
      // 縦書き縁取り
      const colWidth = size * 1.2;
      const totalCols = lines.length;
      const totalHeight = Math.max(...lines.map(l => l.length)) * lineHeight;
      for (let col = 0; col < lines.length; col++) {
        const chars = lines[col].split('');
        const colChars = chars.length;
        let startY;
        if (align === 'start')  startY = padding;
        else if (align === 'end') startY = ctx.canvas.height - padding - colChars * lineHeight;
        else startY = (ctx.canvas.height - colChars * lineHeight) / 2;

        const x = ctx.canvas.width - padding - colWidth * (col + 0.5);
        for (let i = 0; i < chars.length; i++) {
          ctx.strokeText(chars[i], x - size / 2, startY + i * lineHeight);
        }
      }
    } else {
      // 横書き縁取り
      ctx.textBaseline = 'top';
      for (let i = 0; i < lines.length; i++) {
        let x;
        const metrics = ctx.measureText(lines[i]);
        if (align === 'center') x = (ctx.canvas.width - metrics.width) / 2;
        else if (align === 'right') x = ctx.canvas.width - padding - metrics.width;
        else x = padding;
        ctx.strokeText(lines[i], x, padding + i * lineHeight);
      }
    }

    ctx.restore();
  }
};
