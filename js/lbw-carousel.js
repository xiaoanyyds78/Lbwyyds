/*!
 * 大国重器光影展 · 3D 立方体轮播组件
 * @author 柳博文
 * @created 2026-11-06
 * @model DeepSeek-V4.1-Flash
 * @description 可无缝循环的立方体轮播：自动翻页 3.2 秒、手动操作不中断、圆点分页器可点击
 * 用法：引入本文件，页面中写 <div class="lbw_carousel" data-lbw-carousel>，
 *      内含需旋转的 .lbw_cube（子元素为 .lbw_cube-face）与 .lbw_dots 容器即可自动初始化。
 */
(function () {
  "use strict";

  var lbw_FACE_ANGLE = 90;      // 立方体每个面之间的夹角（4 个面 = 360°）
  var lbw_DEFAULT_INTERVAL = 3200; // 自动翻页间隔（毫秒）

  /**
   * 计算当前应显示的面序号
   * 功能：把无限累加的计数器换算成 0 ~ n-1 的面索引，实现无缝循环
   * @param {number} lbw_counter 累计翻页次数（可为负数）
   * @param {number} lbw_total 面的总数
   * @returns {number} 当前面索引
   */
  function lbw_getIndex(lbw_counter, lbw_total) {
    return ((lbw_counter % lbw_total) + lbw_total) % lbw_total;
  }

  /**
   * 按容器宽度重新计算立方体几何
   * 功能：为每个面设置 rotateY + translateZ，并把立方体整体后移半个宽度，避免放大溢出
   * @param {HTMLElement} lbw_root 轮播根节点
   * @param {Array} lbw_faces 面节点集合
   */
  function lbw_applyGeometry(lbw_root, lbw_faces) {
    var lbw_half = lbw_root.offsetWidth / 2;
    lbw_faces.forEach(function (lbw_face, lbw_i) {
      lbw_face.style.transform =
        "rotateY(" + lbw_i * lbw_FACE_ANGLE + "deg) translateZ(" + lbw_half + "px)";
    });
    lbw_root.style.setProperty("--lbw_half", lbw_half + "px");
  }

  /**
   * 把立方体旋转到当前计数器对应的角度
   * 功能：写入 translateZ + rotateY，使正面朝向观众的始终是当前索引的面
   * @param {HTMLElement} lbw_root 轮播根节点
   * @param {HTMLElement} lbw_cube 立方体节点
   * @param {number} lbw_counter 累计翻页次数
   */
  function lbw_renderCube(lbw_root, lbw_cube, lbw_counter) {
    lbw_cube.style.transform =
      "translateZ(calc(var(--lbw_half) * -1)) rotateY(" + (-lbw_counter * lbw_FACE_ANGLE) + "deg)";
  }

  /**
   * 同步圆点分页器与文本状态
   * 功能：先清除所有圆点的选中状态，再设置当前圆点选中，并更新无障碍属性
   * @param {Array} lbw_dots 圆点按钮集合
   * @param {number} lbw_index 当前面索引
   */
  function lbw_syncDots(lbw_dots, lbw_index) {
    lbw_dots.forEach(function (lbw_dot, lbw_i) {
      lbw_dot.classList.remove("lbw_is-active");
      lbw_dot.setAttribute("aria-current", "false");
      if (lbw_i === lbw_index) {
        lbw_dot.classList.add("lbw_is-active");
        lbw_dot.setAttribute("aria-current", "true");
      }
    });
  }

  /**
   * 生成圆点分页器
   * 功能：根据面的数量动态创建可点击圆点，点击后跳转到对应面且不停止自动播放
   * @param {HTMLElement} lbw_dotsBox 圆点容器
   * @param {number} lbw_total 面的总数
   * @param {Function} lbw_onPick 点击回调，参数为目标索引
   */
  function lbw_buildDots(lbw_dotsBox, lbw_total, lbw_onPick) {
    lbw_dotsBox.innerHTML = "";
    for (var lbw_i = 0; lbw_i < lbw_total; lbw_i++) {
      var lbw_dot = document.createElement("button");
      lbw_dot.type = "button";
      lbw_dot.className = "lbw_dot";
      lbw_dot.setAttribute("aria-label", "第 " + (lbw_i + 1) + " 张：跳到该页");
      lbw_dot.addEventListener("click", function () {
        lbw_onPick(Number(this.getAttribute("data-lbw-index")));
      });
      lbw_dot.setAttribute("data-lbw-index", lbw_i);
      lbw_dotsBox.appendChild(lbw_dot);
    }
  }

  /**
   * 初始化一个立方体轮播
   * 功能：绑定上一张/下一张、圆点点击与窗口尺寸变化，并启动 3.2 秒自动翻页
   * @param {HTMLElement|string} lbw_target 轮播容器或选择器
   * @param {Object} [lbw_options] 可选配置：interval 自动翻页间隔
   * @returns {Object|null} 实例方法（next / prev / go），容器不存在时返回 null
   */
  function lbw_initCube(lbw_target, lbw_options) {
    var lbw_root =
      typeof lbw_target === "string" ? document.querySelector(lbw_target) : lbw_target;
    if (!lbw_root) return null;

    var lbw_cube = lbw_root.querySelector(".lbw_cube");
    var lbw_faces = Array.prototype.slice.call(lbw_root.querySelectorAll(".lbw_cube-face"));
    var lbw_dotsBox = lbw_root.querySelector(".lbw_dots");
    var lbw_prevBtn = lbw_root.querySelector(".lbw_arrow-prev");
    var lbw_nextBtn = lbw_root.querySelector(".lbw_arrow-next");
    if (!lbw_cube || lbw_faces.length === 0 || !lbw_dotsBox) return null;

    var lbw_total = lbw_faces.length;
    var lbw_interval = (lbw_options && lbw_options.interval) || lbw_DEFAULT_INTERVAL;
    var lbw_counter = 0;   // 只增不减的累计计数，保证向左向右都能无缝循环
    var lbw_timer = null;
    var lbw_dots = [];

    // 移动到位：旋转立方体 + 同步圆点（不清除自动播放）
    function lbw_go(lbw_targetIndex) {
      lbw_counter = lbw_targetIndex;
      lbw_renderCube(lbw_root, lbw_cube, lbw_counter);
      lbw_syncDots(lbw_dots, lbw_getIndex(lbw_counter, lbw_total));
      lbw_faces.forEach(function (lbw_face, lbw_i) {
        lbw_face.setAttribute(
          "aria-hidden",
          lbw_i === lbw_getIndex(lbw_counter, lbw_total) ? "false" : "true"
        );
      });
    }

    function lbw_next() { lbw_go(lbw_counter + 1); }
    function lbw_prev() { lbw_go(lbw_counter - 1); }

    /**
     * 启动（或重启）自动翻页
     * 功能：手动操作后只重置计时起点，不取消自动播放
     */
    function lbw_startAuto() {
      clearInterval(lbw_timer);
      lbw_timer = setInterval(lbw_next, lbw_interval);
    }

    // 首次构建：几何 + 圆点 + 初始状态
    lbw_dotsBox.innerHTML = "";
    lbw_buildDots(lbw_dotsBox, lbw_total, function (lbw_index) {
      lbw_go(lbw_index);
      lbw_startAuto();
    });
    lbw_dots = Array.prototype.slice.call(lbw_dotsBox.querySelectorAll(".lbw_dot"));

    lbw_applyGeometry(lbw_root, lbw_faces);
    lbw_counter = 0;
    lbw_go(0);
    lbw_startAuto();

    // 手动上一张 / 下一张：执行后自动播放继续
    if (lbw_prevBtn) {
      lbw_prevBtn.addEventListener("click", function () { lbw_prev(); lbw_startAuto(); });
    }
    if (lbw_nextBtn) {
      lbw_nextBtn.addEventListener("click", function () { lbw_next(); lbw_startAuto(); });
    }

    // 窗口尺寸变化时重算立方体几何
    window.addEventListener("resize", function () {
      lbw_applyGeometry(lbw_root, lbw_faces);
      lbw_renderCube(lbw_root, lbw_cube, lbw_counter);
    });

    return { next: lbw_next, prev: lbw_prev, go: lbw_go };
  }

  /**
   * 初始化页面上所有轮播
   * 功能：扫描 [data-lbw-carousel] 容器，读取 data-lbw-interval 作为翻页间隔
   */
  function lbw_initAllCarousels() {
    var lbw_list = document.querySelectorAll("[data-lbw-carousel]");
    Array.prototype.forEach.call(lbw_list, function (lbw_el) {
      lbw_initCube(lbw_el, {
        interval: Number(lbw_el.getAttribute("data-lbw-interval")) || lbw_DEFAULT_INTERVAL,
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lbw_initAllCarousels);
  } else {
    lbw_initAllCarousels();
  }

  // 暴露给外部，便于动态创建的轮播手动初始化
  window.lbw_initCube = lbw_initCube;
})();
