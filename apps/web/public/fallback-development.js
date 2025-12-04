/******/ (() => { // webpackBootstrap
/******/ 	"use strict";


self.fallback = async request => {
  // https://developer.mozilla.org/en-US/docs/Web/API/RequestDestination
  switch (request.destination) {
    case 'document':
      if (true) return caches.match("/offline.html", {
        ignoreSearch: true
      });
    case 'image':
      if (true) return caches.match("/icons/icon-192.png", {
        ignoreSearch: true
      });
    case 'audio':
      if (true) return caches.match("/offline.html", {
        ignoreSearch: true
      });
    case 'video':
      if (true) return caches.match("/offline.html", {
        ignoreSearch: true
      });
    case 'font':
      if (true) return caches.match("/offline.html", {
        ignoreSearch: true
      });
    case '':
      if (false) {}
    default:
      return Response.error();
  }
};
/******/ })()
;