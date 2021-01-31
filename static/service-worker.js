importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js');

// cache name
workbox.core.setCacheNameDetails({
    prefix: 'perry-cache',
    precache: 'precache',
    runtime: 'runtime',
  });
  
// runtime cache

workbox.routing.registerRoute(
    new RegExp('/static/.*'),
    new workbox.strategies.NetworkFirst({
			cacheName: 'perry-cache-Static'
		})
);

// 1. stylesheet
workbox.routing.registerRoute(
    new RegExp('\.css$'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'perry-cache-Stylesheets'
    })
);
workbox.routing.registerRoute(
    new RegExp('\.js$'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'perry-cache-Scripts'
    })
);
// 2. images
workbox.routing.registerRoute(
    new RegExp('\.(png|svg|jpg|jpeg)$'),
    new workbox.strategies.NetworkFirst({
        cacheName: 'perry-cache-Images'
    })
);
workbox.routing.registerRoute(
    new RegExp('/.*'),
    new workbox.strategies.NetworkFirst()
);


workbox.precaching.precacheAndRoute([]);