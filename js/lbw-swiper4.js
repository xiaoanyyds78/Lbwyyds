/**
 * @file lbw-swiper4.js
 * @author 柳博文
 * @created 2026-11-11
 * @model DeepSeek-V4.1-Flash
 * @description 演示四：以 id 选择器 '#lbw_swiper4' 初始化 Swiper 轮播，并同步状态显示
 */
(function () {
  "use strict";

  var lbw_selector = "#lbw_swiper4";

  /**
   * 创建 Swiper 实例
   * 功能：按固定配置初始化轮播——无缝循环、3.2 秒自动翻页（手动操作后不停）、可点击圆点分页、初始 cube 效果
   * @returns {Swiper} Swiper 实例
   */
  function lbw_createSwiper() {
    return new Swiper(lbw_selector, {
      loop: true,
      speed: 650,
      grabCursor: true,
      effect: "cube",
      cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowOffset: 20,
        shadowScale: 0.94
      },
      autoplay: {
        delay: 3200,
        disableOnInteraction: false
      },
      pagination: {
        el: "#lbw_pager4",
        clickable: true
      },
      navigation: {
        prevEl: "#lbw_prev4",
        nextEl: "#lbw_next4"
      },
      keyboard: {
        enabled: true
      },
      a11y: {
        prevSlideMessage: "上一张",
        nextSlideMessage: "下一张"
      }
    });
  }

  /**
   * 同步状态文字
   * 功能：把当前页码写入状态栏，页码从 1 开始计
   * @param {Swiper} swiper 实例
   */
  function lbw_syncStatus(swiper) {
    var lbw_num = document.getElementById("lbw_current4");
    if (lbw_num) {
      lbw_num.textContent = swiper.realIndex + 1;
    }
  }

  /**
   * 绑定实例事件
   * 功能：切换时更新页码；悬停暂停自动播放时同步开关状态
   * @param {Swiper} swiper 实例
   */
  function lbw_bindEvents(swiper) {
    swiper.on("slideChange", function () {
      lbw_syncStatus(swiper);
    });

    swiper.on("autoplayPause", function () {
      var lbw_auto = document.getElementById("lbw_auto4");
      if (lbw_auto) lbw_auto.textContent = "暂停";
    });

    swiper.on("autoplayResume", function () {
      var lbw_auto = document.getElementById("lbw_auto4");
      if (lbw_auto) lbw_auto.textContent = "开";
    });
  }

  /**
   * 启动
   * 功能：确认容器与 Swiper 脚本都存在后再初始化，避免脚本缺失时报错
   */
  function lbw_start() {
    if (typeof Swiper === "undefined") return;
    if (!document.querySelector(lbw_selector)) return;

    var lbw_swiper4 = lbw_createSwiper();
    lbw_bindEvents(lbw_swiper4);
    lbw_syncStatus(lbw_swiper4);

    // 暴露给控制台调试
    window.lbw_swiper4 = lbw_swiper4;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lbw_start);
  } else {
    lbw_start();
  }
})();
