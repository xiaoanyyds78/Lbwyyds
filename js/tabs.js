/**
 * @file tabs.js
 * @author 柳博文
 * @created 2026-11-04
 * @model DeepSeek-V4.1-Flash
 * @description 可复用的 Tab 选项卡组件：自动绑定页面上所有 .lbw_tabs 容器，
 *              支持点击与键盘切换，切换时先清除全部选项卡的选中状态，再设置当前项。
 *
 * 使用方式（HTML 结构约定）：
 *   <nav class="lbw_tabs" role="tablist">
 *     <button class="lbw_tab" role="tab" aria-controls="lbw_panelA" aria-selected="true">A</button>
 *     <button class="lbw_tab" role="tab" aria-controls="lbw_panelB" aria-selected="false" tabindex="-1">B</button>
 *   </nav>
 *   <section class="lbw_panel lbw_is-active" id="lbw_panelA" role="tabpanel">...</section>
 *   <section class="lbw_panel" id="lbw_panelB" role="tabpanel">...</section>
 *
 * 只需引入本文件，无需写任何初始化代码；也可手动调用 lbw_initTabs(容器元素)。
 */
(function (lbw_global, lbw_doc) {
  "use strict";

  var lbw_ACTIVE_CLASS = "lbw_is-active";

  /**
   * 初始化单个选项卡容器：读取默认选中项、绑定点击与键盘事件、切换到默认项
   * @param {HTMLElement} lbw_root 带 .lbw_tabs 类（或 role="tablist"）的容器
   * @returns {boolean} 是否完成初始化（已初始化过的容器返回 false）
   */
  function lbw_initTabs(lbw_root) {
    if (!lbw_root || lbw_root.getAttribute("data-lbw_tabs-ready") === "true") {
      return false;
    }
    lbw_root.setAttribute("data-lbw_tabs-ready", "true");

    var lbw_tabs = Array.prototype.slice.call(lbw_root.querySelectorAll(".lbw_tab"));

    // 按 aria-controls 关联每个选项卡对应的面板，找不到则忽略该面板
    var lbw_panels = lbw_tabs.map(function (lbw_tab) {
      return lbw_doc.getElementById(lbw_tab.getAttribute("aria-controls"));
    });

    // 默认选中：取 HTML 上 aria-selected="true" 的那一项，缺省用第一项
    var lbw_defaultIndex = 0;
    lbw_tabs.forEach(function (lbw_tab, lbw_index) {
      if (lbw_tab.getAttribute("aria-selected") === "true") {
        lbw_defaultIndex = lbw_index;
      }
    });

    /**
     * 切换到指定选项卡：先清除所有选项卡的选中状态，再设置当前元素的选中状态
     * @param {number} lbw_index 目标选项卡序号
     */
    function lbw_activate(lbw_index) {
      if (lbw_index < 0 || lbw_index >= lbw_tabs.length) {
        return;
      }

      // 第一步：清除全部选项卡的选中状态，并隐藏所有面板
      lbw_tabs.forEach(function (lbw_tab, lbw_i) {
        lbw_tab.setAttribute("aria-selected", "false");
        lbw_tab.setAttribute("tabindex", "-1");
        if (lbw_panels[lbw_i]) {
          lbw_panels[lbw_i].classList.remove(lbw_ACTIVE_CLASS);
          lbw_panels[lbw_i].setAttribute("aria-hidden", "true");
        }
      });

      // 第二步：设置当前选项卡为选中状态，并显示对应面板
      var lbw_targetTab = lbw_tabs[lbw_index];
      var lbw_targetPanel = lbw_panels[lbw_index];
      lbw_targetTab.setAttribute("aria-selected", "true");
      lbw_targetTab.setAttribute("tabindex", "0");
      if (lbw_targetPanel) {
        lbw_targetPanel.classList.add(lbw_ACTIVE_CLASS);
        lbw_targetPanel.removeAttribute("aria-hidden");
      }
    }

    /**
     * 从点击目标向上查找所属的选项卡，并返回其序号
     * @param {HTMLElement} lbw_target 事件目标
     * @returns {number} 选项卡序号，未命中返回 -1
     */
    function lbw_findIndex(lbw_target) {
      var lbw_tab = lbw_target.closest(".lbw_tab");
      if (!lbw_tab) {
        return -1;
      }
      return lbw_tabs.indexOf(lbw_tab);
    }

    /**
     * 点击监听：点击某个选项卡后切换到该选项卡
     * @param {MouseEvent} lbw_event 鼠标事件
     */
    function lbw_onClick(lbw_event) {
      var lbw_index = lbw_findIndex(lbw_event.target);
      if (lbw_index >= 0) {
        lbw_activate(lbw_index);
      }
    }

    /**
     * 键盘监听：左右方向键循环切换，Home / End 跳到首尾，并同步移动焦点
     * @param {KeyboardEvent} lbw_event 键盘事件
     */
    function lbw_onKeydown(lbw_event) {
      var lbw_index = lbw_findIndex(lbw_event.target);
      if (lbw_index < 0) {
        return;
      }

      var lbw_next = null;
      if (lbw_event.key === "ArrowRight") {
        lbw_next = (lbw_index + 1) % lbw_tabs.length;
      } else if (lbw_event.key === "ArrowLeft") {
        lbw_next = (lbw_index - 1 + lbw_tabs.length) % lbw_tabs.length;
      } else if (lbw_event.key === "Home") {
        lbw_next = 0;
      } else if (lbw_event.key === "End") {
        lbw_next = lbw_tabs.length - 1;
      }

      if (lbw_next === null) {
        return;
      }
      lbw_event.preventDefault();
      lbw_activate(lbw_next);
      lbw_tabs[lbw_next].focus();
    }

    // 事件监听：在容器上做事件委托，容器内任意选项卡都生效
    lbw_root.addEventListener("click", lbw_onClick);
    lbw_root.addEventListener("keydown", lbw_onKeydown);

    // 进入页面时按 HTML 上的 aria-selected 呈现默认选项
    lbw_activate(lbw_defaultIndex);

    return true;
  }

  /**
   * 自动初始化页面上所有选项卡容器，页面中有多少组 Tab 就初始化多少组
   * @returns {number} 本次初始化的容器数量
   */
  function lbw_initAllTabs() {
    var lbw_containers = lbw_doc.querySelectorAll(".lbw_tabs, [role='tablist']");
    var lbw_count = 0;
    Array.prototype.forEach.call(lbw_containers, function (lbw_container) {
      if (lbw_initTabs(lbw_container)) {
        lbw_count++;
      }
    });
    return lbw_count;
  }

  // 暴露给外部，便于在动态插入的 DOM 上手动初始化
  lbw_global.lbw_initTabs = lbw_initTabs;

  // DOM 就绪后自动初始化；脚本放在 body 末尾时可直接执行
  if (lbw_doc.readyState === "loading") {
    lbw_doc.addEventListener("DOMContentLoaded", lbw_initAllTabs);
  } else {
    lbw_initAllTabs();
  }
})(window, document);
