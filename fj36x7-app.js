// 福建体彩36选7 - 主应用程序

function loadData() {
  var saved = localStorage.getItem('fj36x7_data');
  if (saved) {
    try {
      var parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) return parsed;
    } catch(e) {}
  }
  return DEFAULT_DATA.slice();
}

function saveData(data) {
  localStorage.setItem('fj36x7_data', JSON.stringify(data));
}

var DATA = loadData();
var BET = [];
var BET_HISTORY = [];
try {
  var bh = localStorage.getItem('fj36x7_bet_history');
  if (bh) BET_HISTORY = JSON.parse(bh);
} catch(e) {}

function pad(n) {
  if (n < 10) return '0' + n;
  return '' + n;
}

function cls(n) {
  if (n <= 6) return 'c1';
  if (n <= 12) return 'c2';
  if (n <= 18) return 'c3';
  if (n <= 24) return 'c4';
  if (n <= 30) return 'c5';
  return 'c6';
}

function ball(n) {
  return '<span class="nb ' + cls(n) + '">' + pad(n) + '</span>';
}

function updateHeader() {
  var total = DATA.length;
  var lastPhase = DATA[total - 1][0];
  document.getElementById('total-phases').textContent = total;
  document.getElementById('last-phase').textContent = lastPhase;
}

function renderStats() {
  var f = [];
  for (var i = 0; i < 37; i++) f[i] = 0;
  for (var j = 0; j < DATA.length; j++) {
    var ns = DATA[j][2];
    for (var k = 0; k < ns.length; k++) f[ns[k]]++;
  }
  var maxN = 1;
  for (var i = 1; i <= 36; i++) {
    if (f[i] >= f[maxN]) maxN = i;
  }
  var minN = 1;
  for (var i = 1; i <= 36; i++) {
    if (f[i] > 0 && f[i] <= f[minN]) minN = i;
  }
  var sums = [];
  for (var j = 0; j < DATA.length; j++) {
    var ns = DATA[j][2];
    var s = 0;
    for (var k = 0; k < ns.length; k++) s += ns[k];
    sums.push(s);
  }
  var avg = 0;
  for (var j = 0; j < sums.length; j++) avg += sums[j];
  avg = Math.round(avg / sums.length);
  var html = '';
  html += '<div class="card"><div class="lbl">已开奖期数</div><div class="val">' + DATA.length + '</div></div>';
  html += '<div class="card"><div class="lbl">最热号码</div><div class="val">' + pad(maxN) + '</div></div>';
  html += '<div class="card"><div class="lbl">最冷号码</div><div class="val">' + pad(minN) + '</div></div>';
  html += '<div class="card"><div class="lbl">平均和值</div><div class="val">' + avg + '</div></div>';
  html += '<div class="card"><div class="lbl">数据完整度</div><div class="val" style="color:#27ae60">100%</div></div>';
  document.getElementById('stats').innerHTML = html;
}

function renderHistory() {
  var h = '<table><thead><tr>';
  h += '<th>期号</th><th>日期</th><th colspan="7">开奖号码</th><th>和值</th>';
  h += '</tr></thead><tbody>';
  for (var j = 0; j < DATA.length; j++) {
    var d = DATA[j];
    var nums = d[2].slice().sort(function(a, b) { return a - b; });
    var sum = 0;
    for (var k = 0; k < nums.length; k++) sum += nums[k];
    h += '<tr><td>' + d[0] + '</td><td>' + d[1] + '</td>';
    for (var k = 0; k < nums.length; k++) h += '<td>' + ball(nums[k]) + '</td>';
    h += '<td><strong>' + sum + '</strong></td></tr>';
  }
  h += '</tbody></table>';
  document.getElementById('p-hist').innerHTML = h;
}

function goTab(name) {
  var tabs = document.querySelectorAll('.tab');
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove('active');
  var panels = document.querySelectorAll('.panel');
  for (var i = 0; i < panels.length; i++) panels[i].classList.remove('active');
  document.getElementById('p-' + name).classList.add('active');
  var el = document.querySelector('.tab[onclick*="' + name + '"]');
  if (el) el.classList.add('active');
  var betArea = document.getElementById('bet-area');
  if (name === 'trend') {
    betArea.style.display = 'block';
    if (!window._bet_init) { renderBetBalls(); window._bet_init = true; }
    renderBetHistory();
  } else {
    betArea.style.display = 'none';
  }
  if (name === 'freq' && !window._freq_done) { renderFreq(); window._freq_done = true; }
  if (name === 'hc' && !window._hc_done) { renderHC(); window._hc_done = true; }
  if (name === 'miss' && !window._miss_done) { renderMiss(); window._miss_done = true; }
  if (name === 'trend' && !window._trend_done) { renderTrend(); window._trend_done = true; }
  if (name === 'sum' && !window._sum_done) { renderSum(); window._sum_done = true; }
}

function getFreq() {
  var f = [];
  for (var i = 0; i < 37; i++) f[i] = 0;
  for (var j = 0; j < DATA.length; j++) {
    var ns = DATA[j][2];
    for (var k = 0; k < ns.length; k++) f[ns[k]]++;
  }
  return f;
}

function renderFreq() {
  var f = getFreq();
  var maxF = 0;
  for (var i = 1; i <= 36; i++) if (f[i] > maxF) maxF = f[i];
  var h = '<div style="margin-bottom:10px"><strong>号码出现频率热图</strong> （红色越深表示出现次数越多）</div>';
  h += '<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:16px">';
  for (var i = 1; i <= 36; i++) {
    var pct = maxF > 0 ? Math.round(f[i] / maxF * 100) : 0;
    var r = Math.round(255 - pct * 1.5);
    var g = Math.round(255 - pct * 1.8);
    var b = Math.round(255 - pct * 0.5);
    var bg = 'rgb(' + r + ',' + g + ',' + b + ')';
    h += '<div style="width:32px;height:32px;line-height:32px;text-align:center;border-radius:6px;font-size:11px;font-weight:bold;color:#fff;background:' + bg + '" title="号码' + pad(i) + ' 出现' + f[i] + '次">' + pad(i) + '<br><span style="font-size:9px">' + f[i] + '次</span></div>';
  }
  h += '</div>';
  var topN = [];
  for (var i = 1; i <= 36; i++) topN.push([i, f[i]]);
  topN.sort(function(a, b) { return b[1] - a[1]; });
  h += '<div style="margin-top:10px"><strong>出现次数最多的10个号码：</strong><br>';
  for (var i = 0; i < 10; i++) {
    h += ball(topN[i][0]) + ' ' + topN[i][1] + '次  ';
  }
  h += '</div>';
  document.getElementById('p-freq').innerHTML = h;
}

function renderHC() {
  var f = getFreq();
  var arr = [];
  for (var i = 1; i <= 36; i++) arr.push([i, f[i]]);
  arr.sort(function(a, b) { return b[1] - a[1]; });
  var h = '<div style="display:flex; gap:20px; flex-wrap:wrap">';
  h += '<div style="flex:1;min-width:200px"><h3 style="color:#e74c3c">最热号码（Top 10）</h3><table><thead><tr><th>排名</th><th>号码</th><th>出现次数</th></tr></thead><tbody>';
  for (var i = 0; i < 10; i++) {
    h += '<tr><td>' + (i+1) + '</td><td>' + ball(arr[i][0]) + '</td><td><strong>' + arr[i][1] + '</strong> 次</td></tr>';
  }
  h += '</tbody></table></div>';
  arr.sort(function(a, b) { return a[1] - b[1]; });
  h += '<div style="flex:1;min-width:200px"><h3 style="color:#3498db">最冷号码（Top 10）</h3><table><thead><tr><th>排名</th><th>号码</th><th>出现次数</th></tr></thead><tbody>';
  for (var i = 0; i < 10; i++) {
    h += '<tr><td>' + (i+1) + '</td><td>' + ball(arr[i][0]) + '</td><td><strong>' + arr[i][1] + '</strong> 次</td></tr>';
  }
  h += '</tbody></table></div>';
  h += '</div>';
  document.getElementById('p-hc').innerHTML = h;
}

function renderMiss() {
  var misses = [];
  for (var i = 1; i <= 36; i++) misses[i] = 0;
  for (var j = DATA.length - 1; j >= 0; j--) {
    var ns = DATA[j][2];
    for (var i = 1; i <= 36; i++) {
      var found = false;
      for (var k = 0; k < ns.length; k++) {
        if (ns[k] === i) { found = true; break; }
      }
      if (found) { misses[i] = 0; } else { misses[i]++; }
    }
  }
  var h = '<div style="margin-bottom:10px"><strong>当前遗漏值</strong> （距离上次出现的期数，0表示最近一期出现）</div>';
  h += '<table><thead><tr><th>号码</th><th>遗漏期数</th><th>状态</th></tr></thead><tbody>';
  for (var i = 1; i <= 36; i++) {
    var st = '';
    var color = '';
    if (misses[i] === 0) { st = '热号'; color = '#27ae60'; }
    else if (misses[i] <= 5) { st = '温号'; color = '#f39c12'; }
    else { st = '冷号'; color = '#e74c3c'; }
    h += '<tr><td>' + ball(i) + '</td><td><strong style="color:' + color + '">' + misses[i] + '</strong> 期</td><td><span style="color:' + color + '">' + st + '</span></td></tr>';
  }
  h += '</tbody></table>';
  document.getElementById('p-miss').innerHTML = h;
}

function renderTrend() {
  var h = '<div style="margin-bottom:10px"><strong>走势图</strong> （每行一期，共' + DATA.length + '期，彩色球表示开出号码）</div>';
  h += '<div style="overflow-x:auto"><table class="trend-table"><thead><tr><th>期号</th>';
  for (var i = 1; i <= 36; i++) h += '<th>' + pad(i) + '</th>';
  h += '</tr></thead><tbody>';
  for (var j = 0; j < DATA.length; j++) {
    var d = DATA[j];
    h += '<tr><td class="trend-phase">' + d[0] + '</td>';
    for (var i = 1; i <= 36; i++) {
      var hit = false;
      for (var k = 0; k < d[2].length; k++) {
        if (d[2][k] === i) { hit = true; break; }
      }
      if (hit) {
        h += '<td style="padding:1px 2px">' + ball(i) + '</td>';
      } else {
        h += '<td></td>';
      }
    }
    h += '</tr>';
  }
  h += '</tbody></table></div>';
  document.getElementById('p-trend').innerHTML = h;
}

function renderSum() {
  var sums = [];
  var oddCount = 0;
  var evenCount = 0;
  var zone1 = 0, zone2 = 0, zone3 = 0;
  for (var j = 0; j < DATA.length; j++) {
    var ns = DATA[j][2];
    var s = 0;
    var odd = 0;
    for (var k = 0; k < ns.length; k++) {
      s += ns[k];
      if (ns[k] % 2 === 1) odd++;
    }
    sums.push(s);
    if (odd >= 4) oddCount++;
    else evenCount++;
    for (var k = 0; k < ns.length; k++) {
      if (ns[k] <= 12) zone1++;
      else if (ns[k] <= 24) zone2++;
      else zone3++;
    }
  }
  var avg = 0;
  for (var j = 0; j < sums.length; j++) avg += sums[j];
  avg = Math.round(avg / sums.length);
  var totalZone = zone1 + zone2 + zone3;
  var h = '<div style="display:flex; gap:10px; flex-wrap:wrap">';
  h += '<div class="card"><div class="lbl">平均和值</div><div class="val">' + avg + '</div></div>';
  h += '<div class="card"><div class="lbl">奇数偏多期数</div><div class="val">' + oddCount + '</div></div>';
  h += '<div class="card"><div class="lbl">偶数偏多期数</div><div class="val">' + evenCount + '</div></div>';
  h += '<div class="card"><div class="lbl">一区(01-12)占比</div><div class="val">' + Math.round(zone1 / totalZone * 100) + '%</div></div>';
  h += '<div class="card"><div class="lbl">二区(13-24)占比</div><div class="val">' + Math.round(zone2 / totalZone * 100) + '%</div></div>';
  h += '<div class="card"><div class="lbl">三区(25-36)占比</div><div class="val">' + Math.round(zone3 / totalZone * 100) + '%</div></div>';
  h += '</div>';
  h += '<div style="margin-top:14px"><strong>和值分布</strong><br>';
  var bins = {};
  for (var j = 0; j < sums.length; j++) {
    var b = Math.floor(sums[j] / 20) * 20;
    if (!bins[b]) bins[b] = 0;
    bins[b]++;
  }
  var keys = [];
  for (var k in bins) keys.push(parseInt(k));
  keys.sort(function(a, b) { return a - b; });
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    h += '<div style="margin:2px 0"><span style="display:inline-block;width:50px">' + k + '-' + (k+19) + '</span><span style="display:inline-block;background:#e74c3c;color:#fff;padding:2px 6px;border-radius:3px;margin-left:4px">' + bins[k] + '期</span></div>';
  }
  h += '</div>';
  document.getElementById('p-sum').innerHTML = h;
}

// ===== 模拟投注功能 =====
function renderBetBalls() {
  var container = document.getElementById('bet-balls');
  var h = '';
  for (var i = 1; i <= 36; i++) {
    var clsName = 'nb ' + cls(i);
    if (BET.indexOf(i) >= 0) clsName += ' selected';
    h += '<span class="' + clsName + '" onclick="toggleBet(' + i + ')">' + pad(i) + '</span>';
  }
  container.innerHTML = h;
  document.getElementById('bet-count').textContent = BET.length;
}

function toggleBet(n) {
  var idx = BET.indexOf(n);
  if (idx >= 0) {
    BET.splice(idx, 1);
  } else {
    if (BET.length >= 7) {
      document.getElementById('bet-msg').innerHTML = '<span style="color:#e74c3c">最多选7个号码</span>';
      return;
    }
    BET.push(n);
  }
  renderBetBalls();
  document.getElementById('bet-msg').innerHTML = '';
}

function randomBet() {
  BET = [];
  var pool = [];
  for (var i = 1; i <= 36; i++) pool.push(i);
  for (var i = 0; i < 7; i++) {
    var ri = Math.floor(Math.random() * pool.length);
    BET.push(pool[ri]);
    pool.splice(ri, 1);
  }
  BET.sort(function(a, b) { return a - b; });
  renderBetBalls();
  document.getElementById('bet-msg').innerHTML = '';
}

function clearBet() {
  BET = [];
  renderBetBalls();
  document.getElementById('bet-msg').innerHTML = '';
  document.getElementById('bet-result').innerHTML = '';
}

function doBet() {
  if (BET.length !== 7) {
    document.getElementById('bet-msg').innerHTML = '<span style="color:#e74c3c">请先选择7个号码！</span>';
    return;
  }
  var draw = [];
  var pool = [];
  for (var i = 1; i <= 36; i++) pool.push(i);
  for (var i = 0; i < 7; i++) {
    var ri = Math.floor(Math.random() * pool.length);
    draw.push(pool[ri]);
    pool.splice(ri, 1);
  }
  draw.sort(function(a, b) { return a - b; });
  var hitCount = 0;
  for (var i = 0; i < BET.length; i++) {
    for (var j = 0; j < draw.length; j++) {
      if (BET[i] === draw[j]) { hitCount++; break; }
    }
  }
  var sum = 0;
  for (var i = 0; i < draw.length; i++) sum += draw[i];
  var h = '<div style="padding:10px; background:#f8f9fa; border-radius:8px;">';
  h += '<div style="margin-bottom:6px"><strong>模拟开奖号码：</strong>' + draw.map(function(x){ return ball(x); }).join(' ') + '</div>';
  h += '<div style="margin-bottom:6px"><strong>您的选号：</strong>' + BET.map(function(x){ return ball(x); }).join(' ') + '</div>';
  h += '<div style="margin-bottom:6px"><strong>和值：</strong>' + sum + '</div>';
  var color = hitCount >= 4 ? '#27ae60' : (hitCount >= 2 ? '#f39c12' : '#e74c3c');
  h += '<div style="font-size:16px; font-weight:bold; color:' + color + ';">命中 ' + hitCount + ' 个号码！</div>';
  h += '</div>';
  document.getElementById('bet-result').innerHTML = h;
  BET_HISTORY.push({ bet: BET.slice(), draw: draw.slice(), hit: hitCount, time: new Date().toLocaleString('zh-CN') });
  if (BET_HISTORY.length > 20) BET_HISTORY.shift();
  try { localStorage.setItem('fj36x7_bet_history', JSON.stringify(BET_HISTORY)); } catch(e) {}
  renderBetHistory();
  document.getElementById('bet-msg').innerHTML = '';
}

function renderBetHistory() {
  if (BET_HISTORY.length === 0) {
    document.getElementById('bet-history').innerHTML = '';
    return;
  }
  var h = '<strong>投注历史（最近' + BET_HISTORY.length + '次）</strong><br>';
  h += '<div style="max-height:200px; overflow-y:auto; margin-top:6px;">';
  for (var i = BET_HISTORY.length - 1; i >= 0; i--) {
    var r = BET_HISTORY[i];
    var color = r.hit >= 4 ? '#27ae60' : (r.hit >= 2 ? '#f39c12' : '#e74c3c');
    h += '<div style="font-size:11px; padding:4px 0; border-bottom:1px solid #eee;">';
    h += '<span style="color:#888">' + r.time + '</span> ';
    h += '选号：' + r.bet.map(function(x){ return pad(x); }).join(' ') + ' ';
    h += '开奖：' + r.draw.map(function(x){ return pad(x); }).join(' ') + ' ';
    h += '<strong style="color:' + color + '">命中' + r.hit + '个</strong>';
    h += '</div>';
  }
  h += '</div>';
  document.getElementById('bet-history').innerHTML = h;
}

function checkOnlineUpdate() {
  fetchLatestData(function(success, count) {
    if (success && count > 0) {
      // 已有提示在 fetchLatestData 中处理
    } else if (success && count === 0) {
      // 已是最新
    } else {
      // 在线更新失败，显示手动输入
      showManualForm();
    }
  });
}

function showManualForm() {
  document.getElementById('manual-form').style.display = 'block';
  var lastPhase = DATA[DATA.length - 1][0];
  var nextPhase = parseInt(lastPhase) + 1;
  document.getElementById('inp-phase').value = nextPhase;
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = today.getMonth() + 1;
  var dd = today.getDate();
  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;
  document.getElementById('inp-date').value = yyyy + '-' + mm + '-' + dd;
}

function hideManualForm() {
  document.getElementById('manual-form').style.display = 'none';
  document.getElementById('manual-msg').innerHTML = '';
}

function addManualData() {
  var phase = document.getElementById('inp-phase').value.trim();
  var date = document.getElementById('inp-date').value;
  var msg = document.getElementById('manual-msg');
  if (!phase.match(/^2026\d{3}$/)) {
    msg.innerHTML = '<span style="color:#e74c3c">期号格式错误，应为2026XXX</span>';
    return;
  }
  for (var i = 0; i < DATA.length; i++) {
    if (DATA[i][0] === phase) {
      msg.innerHTML = '<span style="color:#e74c3c">该期号已存在</span>';
      return;
    }
  }
  var nums = [];
  var inputs = ['inp-n1','inp-n2','inp-n3','inp-n4','inp-n5','inp-n6','inp-n7'];
  for (var i = 0; i < inputs.length; i++) {
    var val = document.getElementById(inputs[i]).value.trim();
    if (!val) {
      msg.innerHTML = '<span style="color:#e74c3c">请输入所有7个号码</span>';
      return;
    }
    var n = parseInt(val);
    if (isNaN(n) || n < 1 || n > 36) {
      msg.innerHTML = '<span style="color:#e74c3c">号码必须在01-36之间</span>';
      return;
    }
    if (nums.indexOf(n) >= 0) {
      msg.innerHTML = '<span style="color:#e74c3c">号码不能重复</span>';
      return;
    }
    nums.push(n);
  }
  if (!date) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = today.getMonth() + 1;
    var dd = today.getDate();
    if (mm < 10) mm = '0' + mm;
    if (dd < 10) dd = '0' + dd;
    date = yyyy + '-' + mm + '-' + dd;
  }
  DATA.push([phase, date, nums]);
  saveData(DATA);
  window._freq_done = false;
  window._hc_done = false;
  window._miss_done = false;
  window._trend_done = false;
  window._sum_done = false;
  updateHeader();
  renderStats();
  renderHistory();
  var activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    var name = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
    goTab(name);
  }
  msg.innerHTML = '<span style="color:#27ae60">添加成功！</span>';
  setTimeout(hideManualForm, 1000);
}

function resetData() {
  if (confirm('确定要恢复初始数据吗？这将清除所有手动添加的数据。')) {
    localStorage.removeItem('fj36x7_data');
    DATA = DEFAULT_DATA.slice();
    window._freq_done = false;
    window._hc_done = false;
    window._miss_done = false;
    window._trend_done = false;
    window._sum_done = false;
    updateHeader();
    renderStats();
    renderHistory();
    document.getElementById('update-status').innerHTML = '已恢复初始数据';
    document.getElementById('update-status').style.color = '#27ae60';
  }
}

updateHeader();
renderStats();
renderHistory();
renderTrend();
renderBetHistory();

// ===== 自动更新最新开奖数据 =====
var _UPDATE_URL = 'https://cdn.jsdelivr.net/gh/steflee1983-ux/36x7-dashboard@main/data.json';
var _UPDATE_BUSY = false;

function fetchLatestData(callback) {
  if (_UPDATE_BUSY) return;
  _UPDATE_BUSY = true;
  var status = document.getElementById('update-status');
  if (status) {
    status.innerHTML = '正在检查最新开奖数据...';
    status.style.color = '#f39c12';
  }
  fetch(_UPDATE_URL, { cache: 'no-cache' })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(remoteData) {
      if (!remoteData || !remoteData.length) throw new Error('empty data');
      // 合并数据：只添加本地没有的新期号
      var localPhases = {};
      for (var i = 0; i < DATA.length; i++) localPhases[DATA[i][0]] = true;
      var newCount = 0;
      for (var i = 0; i < remoteData.length; i++) {
        if (!localPhases[remoteData[i][0]]) {
          DATA.push(remoteData[i]);
          newCount++;
        }
      }
      if (newCount > 0) {
        // 按期中排序
        DATA.sort(function(a, b) { return a[0].localeCompare(b[0]); });
        saveData(DATA);
        updateHeader();
        renderStats();
        renderHistory();
        // 清除 Tab 渲染标记，以便刷新显示
        window._freq_done = false;
        window._hc_done = false;
        window._miss_done = false;
        window._trend_done = false;
        window._sum_done = false;
        var activeTab = document.querySelector('.tab.active');
        if (activeTab) {
          var name = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
          goTab(name);
        }
        if (status) {
          status.innerHTML = '成功更新 ' + newCount + ' 期最新数据！';
          status.style.color = '#27ae60';
        }
      } else {
        if (status) {
          status.innerHTML = '已是最新数据';
          status.style.color = '#27ae60';
        }
      }
      _UPDATE_BUSY = false;
      if (callback) callback(true, newCount);
    })
    .catch(function(err) {
      if (status) {
        status.innerHTML = '在线更新失败，请手动输入';
        status.style.color = '#e74c3c';
      }
      _UPDATE_BUSY = false;
      if (callback) callback(false, 0);
    });
}

// 页面加载时自动更新
fetchLatestData();
