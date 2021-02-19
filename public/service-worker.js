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

var precacheConfig = [["2016/08/18/Raspberry-Setting/index.html","1a701149f0cd431acca6962aca0c55a4"],["2016/08/18/sublime-text-C-Setting/index.html","e34ebdda98ffa5e547a0e12bb24650b0"],["2016/08/18/ubuntu-wubi-install/index.html","bbf4af38ead9ddea894baa6cfc3b08ec"],["2016/08/18/windows-uac-white/index.html","271c564448cb04ede900d094075489ad"],["2016/08/23/firefox-event/index.html","b203593ccab4d15e21ad07369d6a2426"],["2016/08/24/clear-float/index.html","72fa63c937d6b367498545617155f530"],["2016/08/24/wordpress-basic/index.html","ce2327ea59c10a302a2fb171a92ca438"],["2016/08/24/wordpress-page/index.html","e7d04667727ce627bff8e00b0595072c"],["2016/08/24/wordpress-sidebar/index.html","f2fcb4f86e3e0821386ff63c39e72a7f"],["2016/12/05/scroll-monitor/index.html","ac08ad3de0eeeaf6d1b144c1e5c96654"],["2016/12/19/removeChild-default/index.html","e7c30c74cb45bee04d9a91b25d08b199"],["2017/02/28/express-mongoose-test/index.html","49fa9d9be9436e58f1c94cdb6558c190"],["2017/03/01/mongoose-population/index.html","373976d08c1d10bde6266a41dcc91690"],["2017/03/07/javascript-module/index.html","9aa8e695d9a0ac90bb18edca170bcb68"],["2017/03/19/create-efi-msr/index.html","5b13fda8402cda0db99b26d7f17be805"],["2017/03/20/mongodb-js-zz/index.html","c5f5de791625518b12d8a29485241440"],["2017/03/24/github-notepad/index.html","220620a25fb080829837250501c39cbb"],["2017/03/24/hls-protocol-analysis/index.html","199a0e007b0c262a5146c99bb3df7ead"],["2017/04/09/VueRouter-VueResource-webpack/index.html","970058c62c4633615283a88db03bc143"],["2017/04/11/vue-cli-module/index.html","f4001dde060e4002af64b77007484750"],["2017/04/27/json-data-formate/index.html","ad7d9366ee8558a8599e6f3617c84345"],["2017/04/27/vue-custom-prop/index.html","fc25fb4e75e07cb03be0bf4cf1cf9872"],["2017/05/10/javascript-event/index.html","c003bed98bc836909cad374871955b96"],["2017/05/24/ajax-pushstate/index.html","b77f2a11110df7dea042aae2f36108e3"],["2017/06/06/underscore-read-01-type-judgment/index.html","3995f2f7019b8b4eecff9de586e7374a"],["2017/06/07/underscore-read-02-judgment-equal/index.html","ac435f11a8366032fed0b2f5d982f3f5"],["2017/06/07/underscore-read-03-clouser-createAssigner/index.html","f48481f8dd025ec723b4d3b6d4013f54"],["2017/06/09/underscore-read-04-optimizeCb-cb-sortedIndex/index.html","291f52c8c985756666088d3dca6bc0b1"],["2017/06/10/underscore-read-05-array-search/index.html","4024e7e48c9c4e35b824a04325c96072"],["2017/06/10/underscore-read-06-flatten-unique/index.html","3efd5e1ae2443a6065b5ea6bc41c50ed"],["2017/06/11/underscore-read-07-Fisher-Yates-shuffle/index.html","2122818ae406ae3c640bbc28651c2586"],["2017/06/11/underscore-read-08-bind-polyfill-and-prototypal-inheritance/index.html","68ec8242df2b60305b0e837d5dd3f53f"],["2017/06/14/underscore-read-09-throttle-debounce/index.html","cb7cc1b1b66f8c4574a21f25f25565d7"],["2017/06/15/underscore-read-10-memoize-tailCall/index.html","b267b39513933af24b69c14fb1dd2e82"],["2017/06/15/underscore-read-11-oop/index.html","6336293d7a5501582c7575f2a0accfa0"],["2017/06/21/javascript-mvc-simple-relize/index.html","5f63f112692296b322d9cad5ea8bf28e"],["2017/07/23/http-detailed/index.html","e7f18af1396bfb1fa727721e0393a767"],["2017/08/02/javascript-vue-data-binding/index.html","72c07550899f837da69b668112aacc1a"],["2017/08/02/javascript-vue-simple-compile/index.html","b0cb94da082910b273790973eb6010d3"],["2017/08/06/webpack-module-karma-test/index.html","b70b2cc0be7d4dd637e5d0314219924d"],["2017/08/27/nodejs-ubuntu-server/index.html","183b4a051dbf3bd502ca985825f7d12b"],["2017/11/14/raspberry-opencv-open-camera/index.html","f4273b6c04a6401e1e3864b508739716"],["2017/12/04/python-socket-img/index.html","8e60eb5f488c2530083176f329f7f0d8"],["2017/12/05/python-mysql/index.html","d209bc9e74932feb2cc59c8e36d41d4a"],["2017/12/07/raspberry-date-sync/index.html","fcfd19de331b45ea8da98b2dd47e2c49"],["2017/12/09/raspberry-startup-boot/index.html","250d55cffa7479a57f54a7c2afd8e3e5"],["2017/12/24/vue-01-find-input/index.html","f740c2b0d254090866bf7a396fe76c50"],["2018/02/02/git-server-create/index.html","ebd9102a58c7b46d67419f70a6382690"],["2018/05/11/angularjs-intro/index.html","b976f7262a83bf87d9d0f3c99bed0332"],["2018/05/13/npm-customize-and-httpservice/index.html","fdf2b613ef68cfe4bce1b57d9cc3dc87"],["2018/06/10/searching-and-ranking/index.html","16085081bfb22635f290610c6b0486c8"],["2018/06/27/machine-optimization/index.html","78c126b207997913691ac880b8c9a823"],["2019/02/13/ios-wkwebview-cookie/index.html","52d96dfc635c20af762f039e797f6120"],["2019/03/09/wechat-custom-qa/index.html","4791c4be65f95fd994345a699483a338"],["2019/07/11/iOS-SDK-configure/index.html","3a173740f661fb5b6b290f04aa1c0e41"],["2019/10/12/react-native-principle-01/index.html","2f08726feae2ae73f7134c37b3fe5a4f"],["2019/10/12/react-native-principle-02/index.html","1eebbfa67aaa590a20b6b883cf322691"],["2019/10/14/react-native-principle-02/index.html","2726a98840fa558ce38f6d3ff13379b1"],["2021/02/19/hls-protocol-analysis/index.html","1daa9842bbb135f2368dacd3cbc83fb8"],["about/index.html","957368070e2737f9f2c9aa6d46b69511"],["archives/index.html","20ec01d885162348902019b9651b0349"],["css/blog_basic.css","a78defddaea957b37321fe7f0bae3948"],["css/font-awesome.min.css","9497dc435d867b8ea4db811cefd98d32"],["css/style.css","db657399a29d4a0dac92e76b9629af47"],["fonts/fontawesome-webfont.eot","7149833697a959306ec3012a8588dcfa"],["fonts/fontawesome-webfont.svg","65bcbc899f379216109acd0b6c494618"],["fonts/fontawesome-webfont.ttf","c4668ed2440df82d3fd2f8be9d31d07d"],["fonts/fontawesome-webfont.woff","d95d6f5d5ab7cfefd09651800b69bd54"],["images/favicon.png","f6feaa1345a1e4444663cadc7f8a6ee3"],["images/ios-wkwebview-cookie/safari-first-cookie.png","17acd9218665611c094f04f649dd5f99"],["images/ios-wkwebview-cookie/safari-has-cookie.png","4e28ac889ffea90320eac22e09e8c7e6"],["images/ios-wkwebview-cookie/safari-second-cookie.png","aa74d09eb8f966161c9add726bc5e09d"],["images/ios-wkwebview-cookie/taobao google1.png","c9084d99d1cfed25d8a1ad0cb209cf03"],["images/ios-wkwebview-cookie/taobao google2.png","d4817a8f2a781fddc1193941dc19c7de"],["images/ios-wkwebview-cookie/taobao safari1.png","0c42a0baa50cd828aa8f759e095fa369"],["images/ios-wkwebview-cookie/taobao safari2.png","ce3676d43eb1de03510e04abf5197966"],["index.html","c8a006710d2d20d2dbd56d70a6e5ec2f"],["js/jquery-migrate-1.2.1.min.js","eb05d8d73b5b13d8d84308a4751ece96"],["js/jquery.appear.js","2cb12aa916a28633bc45c690f3d49edf"],["js/jquery.js","f3346149a7173e70d39e6f36bfb178a4"],["page/2/index.html","ec4946effc4a801feaf74ef2f8a0b1d0"],["page/3/index.html","baca0ca1bb22c81e7f5957292d9b66a6"],["page/4/index.html","0bb47797afe1aa57447305a849e06df9"],["page/5/index.html","50f923dab0158f256e1432ccf023c510"],["page/6/index.html","ab43ac854a032d2af40234c61d444e2a"],["tags/AngularJS/index.html","60e89352559b2966f46a5818d52d2229"],["tags/CSS/index.html","f36730c383a2522bc5c4bef57d6c8055"],["tags/Git/index.html","0423b6f0a542d91c0ad4cbf7db830676"],["tags/HLS/index.html","92a3aec719f1dcbbdfc9a827c89123e2"],["tags/HTTP/index.html","ff6abc0ccf7352a396f8370e663d4393"],["tags/JavaScript/index.html","a417fbcb1c2b60c2520f64bd3d5fcafb"],["tags/JavaScript/page/2/index.html","b7337e353bef50fd2dd02d3ec1b60aa9"],["tags/JavaScript/page/3/index.html","c32f494aa577b7221a6863f1a2f4e474"],["tags/Linux/index.html","b97fd58a0497462854e6c471ee80ad72"],["tags/MongoDB/index.html","c0ffd8e06906482029070c2a7003422c"],["tags/Mysql/index.html","aed403ca6e487507159c1012b6aab064"],["tags/NodeJS/index.html","fabd1c666410c98b0805881ce5ac2009"],["tags/OpenCV/index.html","d3be7661b173bb9fa86214457b0d2aca"],["tags/Python/index.html","cdb8da0861ebd9809b9317b5cefb125a"],["tags/Raspberry/index.html","779b74c00916fe78d05ffe67f1dac96a"],["tags/React-Native/index.html","df3e1904718571bfc01c213e37175cb7"],["tags/System/index.html","88283e9ed26d270f8de1da822506cb7b"],["tags/Tool/index.html","ab3b5286564eb3f575452f0d1aa4db46"],["tags/UnderScore/index.html","f8680ad754509d10dae13bd490f52056"],["tags/UnderScore/page/2/index.html","d7cf42b1527d1ae2a84343c405f28ec6"],["tags/Vue/index.html","38ddb42747f74ad7793e12edfbf3dabe"],["tags/WKWebView/index.html","ec788ac4655d18ff588ee6982e3184ee"],["tags/WebPack/index.html","831041b3f507bb436436f80c012fd34f"],["tags/WordPress/index.html","23d87560854751bcf21c9f0fbee0e82c"],["tags/iOS/index.html","0f1e4848a6c10b5bfdb29afe2f9e4ba1"],["tags/npm/index.html","67f6f1725c3526b40998a33d8407767b"],["tags/微信/index.html","7a8aeb9721639404b4dd89452670083b"],["tags/机器学习/index.html","1713c22c4f0aa68afe05b86cf528f8c6"]];
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







