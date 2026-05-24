/**
 * effects-loader.js
 * エフェクトの登録・管理・UI生成を担当
 *
 * ── 新しいエフェクトの追加方法 ──
 * 1. effects/ フォルダに新しい .js ファイルを作成（stroke.js を参考に）
 * 2. 下の EFFECTS_REGISTRY に追加する（例: 'effects/myeffect.js'）
 * 3. index.html の <head> 内の script タグを追加する
 *    例: <script src="effects/myeffect.js"></script>
 * 4. window.EFFECT_xxx として export されていれば自動でUIが生成される
 */

// ── 登録済みエフェクト一覧 ──
// 新しいエフェクトを追加したらここに追記する
const EFFECTS_REGISTRY = [
  window.EFFECT_stroke,
  window.EFFECT_shadow,
  window.EFFECT_glow,
];

// ── エフェクトスタック（適用順） ──
let effectStack = []; // [{ effectId, params: {key: value} }]

// ── UI生成 ──
function buildEffectsUI(onChangeCallback) {
  const container = document.getElementById('effectStack');
  container.innerHTML = '';

  effectStack.forEach((item, stackIndex) => {
    const def = EFFECTS_REGISTRY.find(e => e.id === item.effectId);
    if (!def) return;

    const card = document.createElement('div');
    card.className = 'effect-card';

    // ヘッダー
    const header = document.createElement('div');
    header.className = 'effect-card-header';
    header.innerHTML = `
      <span class="effect-card-label">${def.label}</span>
      <div class="effect-card-actions">
        <button onclick="moveEffect(${stackIndex}, -1)" title="上へ">↑</button>
        <button onclick="moveEffect(${stackIndex}, 1)" title="下へ">↓</button>
        <button onclick="removeEffect(${stackIndex})" title="削除" class="remove-btn">✕</button>
      </div>
    `;
    card.appendChild(header);

    // パラメータUI
    def.params.forEach(param => {
      const row = document.createElement('div');
      row.className = 'effect-param-row';

      const label = document.createElement('label');
      label.textContent = param.label;
      row.appendChild(label);

      let input;

      if (param.type === 'color') {
        input = document.createElement('input');
        input.type = 'color';
        input.value = item.params[param.id] ?? param.default;
        input.addEventListener('input', () => {
          effectStack[stackIndex].params[param.id] = input.value;
          onChangeCallback();
        });

      } else if (param.type === 'range') {
        const wrap = document.createElement('div');
        wrap.style.display = 'flex';
        wrap.style.alignItems = 'center';
        wrap.style.gap = '8px';
        wrap.style.flex = '1';

        input = document.createElement('input');
        input.type = 'range';
        input.min = param.min; input.max = param.max; input.step = param.step;
        input.value = item.params[param.id] ?? param.default;
        input.style.flex = '1';

        const valSpan = document.createElement('span');
        valSpan.className = 'param-value';
        valSpan.textContent = parseFloat(input.value).toFixed(2);

        input.addEventListener('input', () => {
          effectStack[stackIndex].params[param.id] = parseFloat(input.value);
          valSpan.textContent = parseFloat(input.value).toFixed(2);
          onChangeCallback();
        });

        wrap.appendChild(input);
        wrap.appendChild(valSpan);
        row.appendChild(label);
        row.appendChild(wrap);
        card.appendChild(row);
        card.appendChild(document.createElement('div'));
        // skip normal append
        card.lastChild.remove();
        card.appendChild(row);
        container.appendChild(card); // 後でまとめてやるので仮
        // ↑ 整理のため下に統一
        card.removeChild(row);
        row.innerHTML = '';
        const label2 = document.createElement('label');
        label2.textContent = param.label;
        row.appendChild(label2);
        row.appendChild(wrap);
        card.appendChild(row);
        continue; // forEach なので使えない → 下で統合

      } else if (param.type === 'number') {
        input = document.createElement('input');
        input.type = 'number';
        input.min = param.min; input.max = param.max;
        input.value = item.params[param.id] ?? param.default;
        input.style.width = '70px';
        input.addEventListener('input', () => {
          effectStack[stackIndex].params[param.id] = parseFloat(input.value);
          onChangeCallback();
        });
      }

      if (input) {
        row.appendChild(input);
        card.appendChild(row);
      }
    });

    container.appendChild(card);
  });
}

// forEach内でcontinueが使えないため、UI生成を再実装
function buildEffectsUIClean(onChangeCallback) {
  const container = document.getElementById('effectStack');
  container.innerHTML = '';

  effectStack.forEach((item, stackIndex) => {
    const def = EFFECTS_REGISTRY.find(e => e.id === item.effectId);
    if (!def) return;

    const card = document.createElement('div');
    card.className = 'effect-card';

    // ヘッダー
    const header = document.createElement('div');
    header.className = 'effect-card-header';
    header.innerHTML = `
      <span class="effect-card-label">${def.label}</span>
      <div class="effect-card-actions">
        <button onclick="moveEffect(${stackIndex}, -1)" ${stackIndex===0?'disabled':''}>↑</button>
        <button onclick="moveEffect(${stackIndex}, 1)" ${stackIndex===effectStack.length-1?'disabled':''}>↓</button>
        <button onclick="removeEffect(${stackIndex})" class="remove-btn">✕</button>
      </div>
    `;
    card.appendChild(header);

    def.params.forEach(param => {
      const row = document.createElement('div');
      row.className = 'effect-param-row';
      const label = document.createElement('label');
      label.textContent = param.label;
      row.appendChild(label);

      if (param.type === 'color') {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = item.params[param.id] ?? param.default;
        input.addEventListener('input', () => {
          effectStack[stackIndex].params[param.id] = input.value;
          onChangeCallback();
        });
        row.appendChild(input);

      } else if (param.type === 'range') {
        const wrap = document.createElement('div');
        wrap.className = 'range-wrap';
        const input = document.createElement('input');
        input.type = 'range';
        input.min = param.min; input.max = param.max; input.step = param.step || 0.01;
        input.value = item.params[param.id] ?? param.default;
        const valSpan = document.createElement('span');
        valSpan.className = 'param-value';
        valSpan.textContent = parseFloat(input.value).toFixed(2);
        input.addEventListener('input', () => {
          effectStack[stackIndex].params[param.id] = parseFloat(input.value);
          valSpan.textContent = parseFloat(input.value).toFixed(2);
          onChangeCallback();
        });
        wrap.appendChild(input);
        wrap.appendChild(valSpan);
        row.appendChild(wrap);

      } else if (param.type === 'number') {
        const input = document.createElement('input');
        input.type = 'number';
        input.min = param.min; input.max = param.max;
        input.value = item.params[param.id] ?? param.default;
        input.addEventListener('input', () => {
          effectStack[stackIndex].params[param.id] = parseFloat(input.value);
          onChangeCallback();
        });
        row.appendChild(input);
      }

      card.appendChild(row);
    });

    container.appendChild(card);
  });
}

// ── エフェクト追加 ──
function addEffect(effectId, onChangeCallback) {
  const def = EFFECTS_REGISTRY.find(e => e.id === effectId);
  if (!def) return;
  const defaultParams = {};
  def.params.forEach(p => { defaultParams[p.id] = p.default; });
  effectStack.push({ effectId, params: defaultParams });
  buildEffectsUIClean(onChangeCallback);
  onChangeCallback();
}

// ── エフェクト削除 ──
function removeEffect(index) {
  effectStack.splice(index, 1);
  const cb = window.__effectChangeCallback;
  buildEffectsUIClean(cb);
  cb();
}

// ── エフェクト移動 ──
function moveEffect(index, direction) {
  const target = index + direction;
  if (target < 0 || target >= effectStack.length) return;
  [effectStack[index], effectStack[target]] = [effectStack[target], effectStack[index]];
  const cb = window.__effectChangeCallback;
  buildEffectsUIClean(cb);
  cb();
}

// ── エフェクト全適用（描画前に呼ぶ） ──
function applyEffects(ctx, lines, layout) {
  effectStack.forEach(item => {
    const def = EFFECTS_REGISTRY.find(e => e.id === item.effectId);
    if (def && def.apply) {
      def.apply(ctx, lines, item.params, layout);
    }
  });
}

// ── セレクタのオプション生成 ──
function populateEffectSelector() {
  const sel = document.getElementById('effectSelector');
  EFFECTS_REGISTRY.forEach(def => {
    const opt = document.createElement('option');
    opt.value = def.id;
    opt.textContent = def.label;
    sel.appendChild(opt);
  });
}
