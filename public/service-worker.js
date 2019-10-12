/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["2016/08/18/Raspberry-Setting/index.html","7902aed4af525a9c91af64a50b1fd607"],["2016/08/18/sublime-text-C-Setting/index.html","806bc7d256d6ab2aae82ac2d61f53a7a"],["2016/08/18/ubuntu-wubi-install/index.html","47c1a400d9ac6afc55646bfb3f49dfc2"],["2016/08/18/windows-uac-white/index.html","723aa2d39c3f74cf516b7902391bd370"],["2016/08/23/firefox-event/index.html","d2104286836ad3962833e2c30e935a18"],["2016/08/24/clear-float/index.html","96089c5b435cd19c057f72b08587daf5"],["2016/08/24/wordpress-basic/index.html","2f1b81510258a2bdbafc409cd72e2621"],["2016/08/24/wordpress-page/index.html","544686938303bca8cbf9d56ce492b60a"],["2016/08/24/wordpress-sidebar/index.html","1b07ebf92b47f339b29a8f16e67f6a6d"],["2016/12/05/scroll-monitor/index.html","991e08670bb3018083684d269af4f1ed"],["2016/12/19/removeChild-default/index.html","05a9dc465cae5aff810d831af63c3d42"],["2017/02/28/express-mongoose-test/index.html","fcbb7d0bd0c90cf3c74a4e248f40cfa9"],["2017/03/01/mongoose-population/index.html","b4aa8f1016c2f263d7bc7e4773123b66"],["2017/03/07/javascript-module/index.html","d3fd213f77be9435fff6c4db4bbf84e1"],["2017/03/19/create-efi-msr/index.html","46da09cb94a5ef61f16022da903ee680"],["2017/03/20/mongodb-js-zz/index.html","ea9777e330bc064421be7bb7b4218a25"],["2017/03/24/github-notepad/index.html","84423afaad0cd19f4fe805b197c60925"],["2017/04/09/VueRouter-VueResource-webpack/index.html","925f4bf92a18c07db19f8adb5e55b221"],["2017/04/11/vue-cli-module/index.html","9a59431a9e778d9f94a1c86c2a741af4"],["2017/04/27/json-data-formate/index.html","1e65531e8a40195ca5378a32a6e0bf05"],["2017/04/27/vue-custom-prop/index.html","1d744b19784ea0ecc0cae93d3e6dadbe"],["2017/05/10/javascript-event/index.html","ec29fa15de5e30247aadcdefd6432baa"],["2017/05/24/ajax-pushstate/index.html","5c2caf7dddf0720ba3e4ad89b6867205"],["2017/06/06/underscore-read-01-type-judgment/index.html","f72ea0a41fe353948d93a8c7015f1e14"],["2017/06/07/underscore-read-02-judgment-equal/index.html","cab93a5fbd8ef71ef723312da9d3de3e"],["2017/06/07/underscore-read-03-clouser-createAssigner/index.html","efbe47adf96c7fab247b7775e573ac25"],["2017/06/09/underscore-read-04-optimizeCb-cb-sortedIndex/index.html","9a4029d5e96d5124cda4da7e69d48c70"],["2017/06/10/underscore-read-05-array-search/index.html","1a2c1f6443636d40c0f72289de0a9550"],["2017/06/10/underscore-read-06-flatten-unique/index.html","954117fefbf428d7ad30b4f9f5558c41"],["2017/06/11/underscore-read-07-Fisher-Yates-shuffle/index.html","1862bfc81897a6ca6429c52686c0e2ee"],["2017/06/11/underscore-read-08-bind-polyfill-and-prototypal-inheritance/index.html","be49b46d17269104360992e9bfed28e0"],["2017/06/14/underscore-read-09-throttle-debounce/index.html","79212258c32bfb9c7f6c56d0a95577d2"],["2017/06/15/underscore-read-10-memoize-tailCall/index.html","ae8091bb952c88c7014895c97dcf2c22"],["2017/06/15/underscore-read-11-oop/index.html","b755ef1668c335e85e37f7ce08e13bf1"],["2017/06/21/javascript-mvc-simple-relize/index.html","8bcb65466d5ce71d40eacad6a4956c06"],["2017/07/23/http-detailed/index.html","9777981aa4a257b9956e9f4fe89b1a06"],["2017/08/02/javascript-vue-data-binding/index.html","291e46e67af4da902adeb28511413123"],["2017/08/02/javascript-vue-simple-compile/index.html","5d2e47f6564177e1af9b09db65bc70ba"],["2017/08/06/webpack-module-karma-test/index.html","2789cf05db50bd65239c292b3ba8cca8"],["2017/08/27/nodejs-ubuntu-server/index.html","f9bfc576f226b3c085e62c1980cb3df5"],["2017/11/14/raspberry-opencv-open-camera/index.html","38640c36a95fbe6042f6e6f7bcf797a6"],["2017/12/04/python-socket-img/index.html","08d757693b372985d30bef356b0e1327"],["2017/12/05/python-mysql/index.html","a5602e211461618a414492781b9a5319"],["2017/12/07/raspberry-date-sync/index.html","18bcfe10ed05ea346217266de8142678"],["2017/12/09/raspberry-startup-boot/index.html","bfbc19f28d426cf1f2db7f29872ee773"],["2017/12/24/vue-01-find-input/index.html","df3ac071f8c9d06b807bdc8ac88400dd"],["2018/02/02/git-server-create/index.html","929b7037b9f4c28c4d94dcc047fb46c6"],["2018/05/11/angularjs-intro/index.html","c1e8982a46e5b86e96db5b1fcaa36d29"],["2018/05/13/npm-customize-and-httpservice/index.html","df4f0729da353572a538c6778f5d0374"],["2018/06/10/searching-and-ranking/index.html","38be1c5dd39cb28a78172f74b5aed153"],["2018/06/27/machine-optimization/index.html","45a4fa2660e2f62181358ba0cf69f971"],["2019/02/13/ios-wkwebview-cookie/index.html","c0bedfdb15c8341a5eda4b42b6c7416a"],["2019/03/09/wechat-custom-qa/index.html","87f10c785ab23b4351735d7689c8a3b3"],["2019/07/11/iOS-SDK-configure/index.html","6143921e2b432d66f814d4199e027911"],["2019/10/12/react-native-principle-01/index.html","f0f3d2187d61c034c8f3ac53bca7aac5"],["about/index.html","db3f17032edb04503d2ec197921263eb"],["archives/index.html","b431fffc6a9e215814c53a836ddcfbdd"],["css/blog_basic.css","a78defddaea957b37321fe7f0bae3948"],["css/font-awesome.min.css","9497dc435d867b8ea4db811cefd98d32"],["css/style.css","db657399a29d4a0dac92e76b9629af47"],["fonts/fontawesome-webfont.eot","7149833697a959306ec3012a8588dcfa"],["fonts/fontawesome-webfont.svg","65bcbc899f379216109acd0b6c494618"],["fonts/fontawesome-webfont.ttf","c4668ed2440df82d3fd2f8be9d31d07d"],["fonts/fontawesome-webfont.woff","d95d6f5d5ab7cfefd09651800b69bd54"],["images/favicon.png","f6feaa1345a1e4444663cadc7f8a6ee3"],["images/ios-wkwebview-cookie/safari-first-cookie.png","17acd9218665611c094f04f649dd5f99"],["images/ios-wkwebview-cookie/safari-has-cookie.png","4e28ac889ffea90320eac22e09e8c7e6"],["images/ios-wkwebview-cookie/safari-second-cookie.png","aa74d09eb8f966161c9add726bc5e09d"],["images/ios-wkwebview-cookie/taobao google1.png","c9084d99d1cfed25d8a1ad0cb209cf03"],["images/ios-wkwebview-cookie/taobao google2.png","d4817a8f2a781fddc1193941dc19c7de"],["images/ios-wkwebview-cookie/taobao safari1.png","0c42a0baa50cd828aa8f759e095fa369"],["images/ios-wkwebview-cookie/taobao safari2.png","ce3676d43eb1de03510e04abf5197966"],["index.html","c47935b367b0e70782d6b46880001347"],["js/jquery-migrate-1.2.1.min.js","eb05d8d73b5b13d8d84308a4751ece96"],["js/jquery.appear.js","2cb12aa916a28633bc45c690f3d49edf"],["js/jquery.js","f3346149a7173e70d39e6f36bfb178a4"],["page/2/index.html","804f20e5103b5d5740a18bd3d2a75751"],["page/3/index.html","21f42fbf7a57fbb7c9339324e290c485"],["page/4/index.html","c1073fedc8fbcb09132d5e90d1ab4f8f"],["page/5/index.html","54ae6cf30fb21ac6ced8c60df0547130"],["page/6/index.html","3414bb42398d4cfa503122e2ec5b8a85"],["tags/AngularJS/index.html","cdc12848241054c366d56423df28554f"],["tags/CSS/index.html","17867a3f636007b777ff47738ad5fae9"],["tags/Git/index.html","2d80695d38a4abb487fd8583970ec437"],["tags/HTTP/index.html","3b439ed02de7460d55834a7a54b71a7c"],["tags/JavaScript/index.html","ca4089c6c2d16f07304130cf08342da4"],["tags/JavaScript/page/2/index.html","1923a408031664f6d42aba55b1e13760"],["tags/JavaScript/page/3/index.html","728704d6ead9f791d5c8d94b36c3f53d"],["tags/Linux/index.html","4cb6e91faf92f021db51d78a8a3ee62a"],["tags/MongoDB/index.html","30ce7360c92b81080c9e969d859f874c"],["tags/Mysql/index.html","6f5e315a189ddb0a954260420c4ff306"],["tags/NodeJS/index.html","57772a42b8afd0db91dbd2b713cfe2a8"],["tags/OpenCV/index.html","fd9bd1fe2231b566264a3e16c6268d9c"],["tags/Python/index.html","d7a2fc2a6c1fbd6ef8cc491d5a60725a"],["tags/Raspberry/index.html","6806b2e9613801de46b5f164c85e6a8b"],["tags/React-Native/index.html","f95e2f6b21614bbed76d324dca09c07f"],["tags/System/index.html","dece30a6da07ab5511272a22db5ff307"],["tags/Tool/index.html","e7563398383c90617296e26988dd38cd"],["tags/UnderScore/index.html","9d7afd1a52597932959a735ba8c67608"],["tags/UnderScore/page/2/index.html","4f6ae960d73c339b8b9a7f8ca8ef10a1"],["tags/Vue/index.html","781140f51292dc5efcb40f161918f069"],["tags/WKWebView/index.html","d43114df4215303ea617c0386ac6ae03"],["tags/WebPack/index.html","6a09ee4974e2c96601eb4e31674cd42a"],["tags/WordPress/index.html","9f1decbc452b83f1f4f07149983863be"],["tags/iOS/index.html","40873a0d8cb3321f919ace84101b8771"],["tags/npm/index.html","fb29262df627ad00b8b6d3db9c757319"],["tags/微信/index.html","e4839ae9fdda5279a90cfcd2159effe8"],["tags/机器学习/index.html","98fee10270fc516bc7882ba20c7ad316"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function(originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function(originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function(originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function(whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function(originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {
      
      // Force the SW to transition from installing -> active state
      return self.skipWaiting();
      
    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {
      
      return self.clients.claim();
      
    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = 'index.html';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted([], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});







