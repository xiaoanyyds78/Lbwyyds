/*!
 * 大国重器光影展 · Swiper 多效果切换
 * @author 柳博文
 * @created 2026-11-11
 * @model DeepSeek-V4.1-Flash
 * @description 7 种切换效果（cube / slide / fade / flip / coverflow / cards / creative 电影墙），
 *              3.2 秒自动播放、手动操作后不中断、圆点分页器可点击。
 *
 * creativeEffect 的 transform 写法（参考 Swiper demo 257-effect-creative）：
 *   creativeEffect.prev / next 描述「非当前页」相对当前页的变换，支持
 *   - translate: [x, y, z]  位移，百分比按容器宽高计算，z 为景深（负值后移）
 *   - rotate:    [x, y, z]  三轴旋转角度（deg）
 *   - scale / opacity       缩放与透明度
 *   - origin:    'center' | 具体坐标，变换原点
 *   - shadow:    true 时自动叠加阴影
 *   limitProgress 表示最多同时参与变换的相邻页数量，progressMultiplier 控制衰减速度。
 */
(function () {
  "use strict";

  var lbw_DELAY = 3200;      // 自动播放间隔（毫秒）
  var lbw_SWIPER_SELECTOR = ".lbw_swiper";
  var lbw_PAGER_SELECTOR = ".lbw_pager";
  var lbw_swiper = null;

  /**
   * 生成 Swiper 的公用配置
   * 功能：把所有效果共用的自动播放、循环、分页器、左右箭头配置集中返回
   * @returns {Object} Swiper 基础配置
   */
  function lbw_baseConfig() {
    return {
      slidesPerView: 1,
      loop: true,
      speed: 900,
      grabCursor: true,
      // disableOnInteraction:false —— 手动拖拽后自动播放继续
      autoplay: { delay: lbw_DELAY, disableOnInteraction: false },
      // 双击缩放：内建 toggle 关闭，改由 dblclick 监听精确控制（见 lbw_bindZoom）
      zoom: { maxRatio: 3, minRatio: 1, toggle: false },
      pagination: { el: lbw_PAGER_SELECTOR, clickable: true },
      navigation: { prevEl: ".lbw_arrow-prev", nextEl: ".lbw_arrow-next" }
    };
  }

  /**
   * 按效果名补充对应的效果参数
   * 功能：返回包含 effect 及其参数对象的完整配置，creative 即「电影墙」
   * @param {string} lbw_effect 效果名
   * @returns {Object} 完整的 Swiper 配置
   */
  function lbw_buildConfig(lbw_effect) {
    var lbw_config = lbw_baseConfig();

    switch (lbw_effect) {
      case "cube":
        // 立方体：三个面在 3D 空间拼成方块
        lbw_config.effect = "cube";
        lbw_config.cubeEffect = { shadow: true, slideShadows: true, shadowOffset: 20, shadowScale: 0.94 };
        break;

      case "fade":
        lbw_config.effect = "fade";
        lbw_config.fadeEffect = { crossFade: true };
        break;

      case "flip":
        lbw_config.effect = "flip";
        lbw_config.flipEffect = { slideShadows: true, limitRotation: true };
        break;

      case "coverflow":
        lbw_config.effect = "coverflow";
        lbw_config.coverflowEffect = { rotate: 30, stretch: 0, depth: 120, modifier: 1, slideShadows: false };
        break;

      case "cards":
        lbw_config.effect = "cards";
        lbw_config.cardsEffect = { slideShadows: true, rotate: true, perSlideRotate: 2, perSlideOffset: 8 };
        break;

      case "creative":
        // 电影墙：当前页正面居中，前页向后方左侧退去并微微内转，后页从右侧滑入
        lbw_config.effect = "creative";
        lbw_config.creativeEffect = {
          limitProgress: 4,
          shadowPerProgress: true,
          prev: {
            translate: ["-18%", 0, -260],
            rotate: [0, 16, -1.5],
            opacity: 0.55,
            shadow: true
          },
          next: {
            translate: ["104%", 0, -140],
            rotate: [0, -10, 1.5],
            opacity: 0.85,
            shadow: true
          }
        };
        break;

      default:
        lbw_config.effect = "slide";
    }

    return lbw_config;
  }

  /**
   * 重建 Swiper 实例以切换效果
   * 功能：Swiper 不支持运行时直接换效果，先销毁旧实例再按新效果重建，并保持当前页与自动播放
   * @param {string} lbw_effect 目标效果名
   */
  function lbw_applyEffect(lbw_effect) {
    var lbw_index = lbw_swiper ? lbw_swiper.realIndex : 0;

    if (lbw_swiper) {
      lbw_swiper.destroy(true, true);
      lbw_swiper = null;
    }

    lbw_swiper = new Swiper(lbw_SWIPER_SELECTOR, lbw_buildConfig(lbw_effect));
    lbw_swiper.slideToLoop(lbw_index, 0);
  }

  /**
   * 同步效果按钮的选中态
   * 功能：先清除所有按钮的选中状态，再给当前按钮加上选中状态
   * @param {Array} lbw_buttons 按钮集合
   * @param {HTMLElement} lbw_current 当前按钮
   */
  function lbw_syncButtons(lbw_buttons, lbw_current) {
    lbw_buttons.forEach(function (lbw_btn) {
      lbw_btn.classList.remove("lbw_is-active");
      lbw_btn.setAttribute("aria-pressed", "false");
    });
    lbw_current.classList.add("lbw_is-active");
    lbw_current.setAttribute("aria-pressed", "true");
  }

  /**
   * 初始化效果切换按钮
   * 功能：为每个按钮绑定点击监听，点击后切换 Swiper 效果
   */
  function lbw_bindButtons() {
    var lbw_buttons = Array.prototype.slice.call(
      document.querySelectorAll("[data-lbw-effect]")
    );

    lbw_buttons.forEach(function (lbw_btn) {
      lbw_btn.addEventListener("click", function () {
        lbw_syncButtons(lbw_buttons, lbw_btn);
        lbw_applyEffect(lbw_btn.getAttribute("data-lbw-effect"));
      });
    });
  }

  /**
   * 绑定双击缩放
   * 功能：双击图片在 1x 与最大倍率之间切换；放大后再次双击复原
   */
  function lbw_bindZoom() {
    var lbw_el = document.querySelector(lbw_SWIPER_SELECTOR);
    if (!lbw_el) return;

    lbw_el.addEventListener("dblclick", function (e) {
      if (!e.target.closest(".swiper-zoom-container")) return;
      if (!lbw_swiper || !lbw_swiper.zoom) return;

      if (lbw_swiper.zoom.scale > 1) {
        lbw_swiper.zoom.out();
      } else {
        lbw_swiper.zoom.in();
      }
    });
  }

  /**
   * 启动页面
   * 功能：按默认效果创建 Swiper 并绑定按钮，DOM 就绪后执行
   */
  function lbw_start() {
    var lbw_default = document.querySelector("[data-lbw-effect].lbw_is-active");
    lbw_swiper = new Swiper(lbw_SWIPER_SELECTOR, lbw_buildConfig(
      lbw_default ? lbw_default.getAttribute("data-lbw-effect") : "cube"
    ));
    lbw_bindButtons();
    lbw_bindZoom();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lbw_start);
  } else {
    lbw_start();
  }
})();
