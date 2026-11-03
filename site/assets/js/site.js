/* Lift Commerce — site scripts
   Navigation. (The shipping calculator lives in shipping-calculator.js.)
   Page content is static HTML; these scripts only add interactivity. */
(function(){
"use strict";
var $ = function(id){ return document.getElementById(id); };
var money = function(n){ return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };

/* ============================================================
   NAV — dropdowns, keyboard, mobile
   ============================================================ */
(function(){
  var items = Array.prototype.slice.call(document.querySelectorAll("[data-dd]"));
  var isTouchLayout = function(){ return window.matchMedia("(max-width:1100px)").matches; };

  function close(it){
    it.setAttribute("data-open","false");
    var b = it.querySelector(".nav-link");
    if(b.tagName === "BUTTON") b.setAttribute("aria-expanded","false");
  }
  function closeAll(except){
    items.forEach(function(it){ if(it !== except) close(it); });
  }

  items.forEach(function(it){
    var btn = it.querySelector(".nav-link");

    btn.addEventListener("click", function(e){
      e.preventDefault();
      var open = it.getAttribute("data-open") === "true";
      closeAll(it);
      it.setAttribute("data-open", open ? "false" : "true");
      btn.setAttribute("aria-expanded", open ? "false" : "true");
    });

    /* hover only on pointer devices with room for it */
    it.addEventListener("mouseenter", function(){
      if(isTouchLayout()) return;
      closeAll(it);
      it.setAttribute("data-open","true");
      btn.setAttribute("aria-expanded","true");
    });
    it.addEventListener("mouseleave", function(){
      if(isTouchLayout()) return;
      close(it);
    });
  });

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape") closeAll(null);
  });
  document.addEventListener("click", function(e){
    if(!e.target.closest("[data-dd]")) closeAll(null);
  });

  var burger = $("burger"), nav = $("nav");
  burger.addEventListener("click", function(){
    var open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if(!open) closeAll(null);
  });
})();


var yr = $("yr"); if(yr) yr.textContent = new Date().getFullYear();
})();
