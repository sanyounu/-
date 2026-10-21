/* ===========================================================
   桑宗岩 · 个人名片 — 交互
   =========================================================== */

(function () {
  "use strict";

  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 1900);
  }

  /* ---------- 复制内容 ---------- */
  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function copyText(text) {
    if (!navigator.clipboard || !window.isSecureContext) {
      return Promise.resolve(fallbackCopy(text));
    }

    // 剪贴板 API 在个别环境下可能一直挂起，超时后退回 execCommand
    return new Promise(function (resolve) {
      var settled = false;
      var timer = window.setTimeout(function () {
        if (settled) return;
        settled = true;
        resolve(fallbackCopy(text));
      }, 700);

      navigator.clipboard.writeText(text).then(
        function () {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(true);
        },
        function () {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          resolve(fallbackCopy(text));
        }
      );
    });
  }

  document.querySelectorAll("[data-copy]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var value = trigger.getAttribute("data-copy") || "";
      var label = trigger.getAttribute("data-label") || "内容";
      if (!value) return;

      copyText(value).then(function (ok) {
        showToast(ok ? "已复制" + label + " · " + value : "复制失败，请手动选择");
      });
    });
  });

  /* ---------- 鼠标轻微倾斜 ---------- */
  var card = document.getElementById("card");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (card && !reduceMotion && finePointer) {
    var frame = null;
    var target = { x: 0, y: 0 };

    function render() {
      frame = null;
      card.style.transform =
        "rotateX(" + target.y.toFixed(2) + "deg) rotateY(" +
        target.x.toFixed(2) + "deg)";
    }

    card.addEventListener("pointermove", function (event) {
      var rect = card.getBoundingClientRect();
      var px = (event.clientX - rect.left) / rect.width - 0.5;
      var py = (event.clientY - rect.top) / rect.height - 0.5;

      target.x = px * 3.4;
      target.y = -py * 3;

      if (!card.classList.contains("is-tilting")) {
        card.classList.add("is-tilting");
      }
      if (frame === null) {
        frame = window.requestAnimationFrame(render);
      }
    });

    card.addEventListener("pointerleave", function () {
      card.classList.remove("is-tilting");
      card.style.transform = "";
    });
  }

  /* ---------- 平滑滚动（兼容不支持 CSS 平滑滚动的环境） ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var id = link.getAttribute("href").slice(1);
      var targetEl = document.getElementById(id);
      if (!targetEl) return;
      event.preventDefault();
      targetEl.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start"
      });
      if (history.replaceState) {
        history.replaceState(null, "", "#" + id);
      }
      targetEl.setAttribute("tabindex", "-1");
      targetEl.focus({ preventScroll: true });
    });
  });
})();
