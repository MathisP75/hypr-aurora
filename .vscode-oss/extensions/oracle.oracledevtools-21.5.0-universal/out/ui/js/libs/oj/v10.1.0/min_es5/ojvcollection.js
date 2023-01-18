!function(){function e(n){var a="function"==typeof Map?new Map:void 0;return(e=function(e){if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;var n;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==a){if(a.has(e))return a.get(e);a.set(e,l)}function l(){return t(e,arguments,u(this).constructor)}return l.prototype=Object.create(e.prototype,{constructor:{value:l,enumerable:!1,writable:!0,configurable:!0}}),r(l,e)})(n)}function t(e,n,a){return(t=d()?Reflect.construct:function(e,t,n){var a=[null];a.push.apply(a,t);var l=new(Function.bind.apply(e,a));return n&&r(l,n.prototype),l}).apply(null,arguments)}function n(e,t,a){return(n="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var a=function(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=u(e)););return e}(e,t);if(a){var r=Object.getOwnPropertyDescriptor(a,t);return r.get?r.get.call(n):r.value}})(e,t,a||e)}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&r(e,t)}function r(e,t){return(r=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function l(e){var t=d();return function(){var n,a=u(e);if(t){var r=u(this).constructor;n=Reflect.construct(a,arguments,r)}else n=a.apply(this,arguments);return i(this,n)}}function i(e,t){return!t||"object"!==s(t)&&"function"!=typeof t?o(e):t}function o(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function d(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],function(){})),!0}catch(e){return!1}}function u(e){return(u=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function c(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function h(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function f(e,t,n){return t&&h(e.prototype,t),n&&h(e,n),e}
/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */define(["exports","ojs/ojcore-base","ojs/ojlogger","ojs/ojdatacollection-common","ojs/ojcachediteratorresultsdataprovider","ojs/ojdomscroller"],function(t,r,i,d,h,v){"use strict";r=r&&Object.prototype.hasOwnProperty.call(r,"default")?r.default:r,h=h&&Object.prototype.hasOwnProperty.call(h,"default")?h.default:h,v=v&&Object.prototype.hasOwnProperty.call(v,"default")?v.default:v;var m,y=function(){function e(t,n,a){c(this,e),this.root=t,this.dataProvider=n,this.callback=a,this.validKeyTypes=["string","number"],this.fetching=0,this.getKey=function(e){return e.key},n&&(this.modelEventHandler=this._handleModelEvent.bind(this),n.addEventListener("mutate",this.modelEventHandler),n.addEventListener("refresh",this.modelEventHandler))}return f(e,[{key:"setFetching",value:function(e){var t=e?this.fetching+1:this.fetching-1;this.fetching=Math.max(0,t)}},{key:"isFetching",value:function(){return 0!==this.fetching}},{key:"addBusyState",value:function(e){return null!=this.callback?this.callback.addBusyState("DataProviderContentHandler "+e):function(){}}},{key:"destroy",value:function(){this.callback=null,this.dataProvider&&this.modelEventHandler&&(this.dataProvider.removeEventListener("mutate",this.modelEventHandler),this.dataProvider.removeEventListener("refresh",this.modelEventHandler))}},{key:"render",value:function(){return null==this.callback.getData()&&this.fetchRows(),this.renderFetchedData()}},{key:"postRender",value:function(){}},{key:"getDataProvider",value:function(){return this.dataProvider}},{key:"setDataProvider",value:function(e){this.dataProvider=e}},{key:"isReady",value:function(){return!this.fetching}},{key:"verifyKey",value:function(e){return this.validKeyTypes.indexOf(s(e))>-1}},{key:"handleModelRefresh",value:function(){this.callback.setData(null),this.fetchRows()}},{key:"handleItemsAdded",value:function(e){}},{key:"handleItemsRemoved",value:function(e){}},{key:"handleItemsUpdated",value:function(e){}},{key:"_handleModelEvent",value:function(e){if("refresh"===e.type)this.handleModelRefresh();else if("mutate"===e.type){var t=e.detail;t.add&&this.handleItemsAdded(t.add),t.remove&&this.handleItemsRemoved(t.remove),t.update&&this.handleItemsUpdated(t.update)}}}]),e}();(m=t.VirtualizationStrategy||(t.VirtualizationStrategy={}))[m.HIGH_WATER_MARK=0]="HIGH_WATER_MARK",m[m.VIEWPORT_ONLY=1]="VIEWPORT_ONLY";var p=function(){function e(t,n,a,r,l){var i=this;c(this,e),this.element=t,this.dataProvider=n,this.asyncIterator=a,this.callback=r,this.options=l,this._handleScroll=function(e){var t=i.element,n=i._getScrollTop(t),a=t.scrollHeight-t.clientHeight;a>0&&i._handleScrollerScrollTop(n,a)},this._handleModelEvent=function(e){if("mutate"===e.type){var t=e.detail;if(t.add){var n=t.add.indexes,a=t.add.addBeforeKeys;if(null!=a){var r=Array.from(t.add.keys);n=i._handleModelInsert(a,r)}null!=n&&(n=n.sort(function(e,t){return e-t}),i._handleItemsAddedOrRemoved(n,"added"),i.rowCount=i.rowCount+n.length)}if(t.remove){var l=Array.from(t.remove.keys),o=i._handleModelDelete(l);o=o.sort(function(e,t){return t-e}),i._handleItemsAddedOrRemoved(o,"removed"),i.rowCount=Math.max(0,i.rowCount-o.length)}}},this.initialScrollTop=this.element.scrollTop,this.scrollListener=this._handleScroll.bind(this),this._getScrollEventElement().addEventListener("scroll",this.scrollListener),this.modelEventListener=this._handleModelEvent.bind(this),n.addEventListener("mutate",this.modelEventListener),this.fetchSize=l.fetchSize>0?l.fetchSize:25,this.maxCount=l.maxCount>0?l.maxCount:500,this.rowCount=null!=l.keys?l.keys.length:this.fetchSize,this.viewportSize=-1,this.viewportPixelSize=this.element.offsetHeight,this.currentScrollTop=0,this.currentRenderedPoint={startIndex:0,endIndex:isNaN(this.rowCount)?this.fetchSize:this.rowCount,maxCountLimit:!1,done:!1,keys:l.keys},this.lastFetchTrigger=0,this.checkViewportCount=0}return f(e,[{key:"checkViewport",value:function(){if(this.currentRenderedPoint.done||this.currentRenderedPoint.maxCountLimit)return!0;var e=this._isRangeValid(0,this.currentRenderedPoint.end);return e?this.checkViewportCount=0:(this.checkViewportCount+=1,this.checkViewportCount===d.CHECKVIEWPORT_THRESHOLD&&i.warn("Viewport not satisfied after multiple fetch, make sure the component is height constrained or specify a scroller."),this._doFetch()),e}},{key:"_isRenderingViewportOnly",value:function(e){return this.options.strategy===t.VirtualizationStrategy.VIEWPORT_ONLY&&void 0!==e.getIndexForRange}},{key:"setViewportRange",value:function(e,t){null!=this.currentRenderedPoint.start&&null!=this.currentRenderedPoint.end||(this.currentRenderedPoint.start=e,this.currentRenderedPoint.end=t,this._log("got pixel range: "+e+" to "+t+" for renderedPoint: "+this.currentRenderedPoint.startIndex+" "+this.currentRenderedPoint.endIndex)),this._checkRenderedPoints()&&(this.fetchPromise=null,this.currentScrollTop>=this.lastFetchTrigger&&(this.nextFetchTrigger=void 0))}},{key:"destroy",value:function(){this._getScrollEventElement().removeEventListener("scroll",this.scrollListener),this.dataProvider.removeEventListener("mutate",this.modelEventListener)}},{key:"_getScrollEventElement",value:function(){return this.element===document.body||this.element===document.documentElement?window:this.element}},{key:"_getScrollTop",value:function(e){return e===document.documentElement&&(void 0===this.useBodyScrollTop&&(this.useBodyScrollTop=this.initialScrollTop===e.scrollTop),this.useBodyScrollTop)?0+document.body.scrollTop:0+e.scrollTop}},{key:"_setRangeLocal",value:function(e,t,n,a,r,l){var i=this;this._log("rendering row: "+e+" to "+t+" covering range: "+(null==n?"unknown":n)+" to "+(null==a?"unknown":a)),this.callback.beforeFetchByOffset(e,t),this.currentRenderedPoint={startIndex:e,endIndex:t,start:n,end:a,maxCountLimit:r,done:l,keys:[]};var o={offset:e,size:t-e};this.fetchByOffsetPromise=this.dataProvider.fetchByOffset(o).then(function(o){var d=!0;if(null!=n&&null!=a&&(d=i._isRangeValid(n,a)),d){i._log("fetchByOffset "+e+" to "+t+" returned and result is still applicable");var u=[],s=[],c=i.currentRenderedPoint.keys;o.results.forEach(function(e){u.push(e.data),s.push(e.metadata),c.push(e.metadata.key)});var h={};h.startIndex=e,h.maxCountLimit=r,h.done=l,h.value={},h.value.data=u,h.value.metadata=s,i.callback.fetchSuccess(h),i.fetchByOffsetPromise=null}else i._log("fetchByOffset "+e+" to "+t+" returned but result is NO LONGER applicable"),i.fetchByOffsetPromise=null,i.callback.fetchError("notValid"),i._checkRenderedPoints()})}},{key:"_handleScrollerScrollTop",value:function(e,t){if(this.currentScrollTop=e,!this.fetchPromise&&this.asyncIterator){if(isNaN(this.nextFetchTrigger)&&this.lastMaxScrollTop!==t&&(this.nextFetchTrigger=Math.max(0,(t-e)/2),this.lastFetchTrigger=e,this.lastMaxScrollTop=t,this._log("next fetch trigger point: "+Math.round(this.nextFetchTrigger))),null!=this.nextFetchTrigger&&e-this.lastFetchTrigger>this.nextFetchTrigger)return void this._doFetch();if(t-e<1)return void this._doFetch()}this.fetchPromise&&e>this.lastFetchTrigger||this._checkRenderedPoints()}},{key:"_isRangeValid",value:function(e,t){var n=this.currentScrollTop;return this.viewportPixelSize=this.element.offsetHeight,n>=e&&n+this.viewportPixelSize<=t}},{key:"_checkRenderedPoints",value:function(){if(null==this.currentRenderedPoint.start||null==this.currentRenderedPoint.end)return!0;if(this._isRangeValid(this.currentRenderedPoint.start,this.currentRenderedPoint.end))return!0;if(this._isRenderingViewportOnly(this.callback)){var e=this.callback,t=Math.max(0,this.currentScrollTop-this.viewportPixelSize),n=Math.min(this.currentScrollTop+2*this.viewportPixelSize),a=e.getIndexForRange(t,n),r=Math.max(0,a.startIndex),l=null==a.endIndex?this.rowCount:Math.min(this.rowCount,a.endIndex);if(r<this.currentRenderedPoint.startIndex||l>this.currentRenderedPoint.endIndex){var i=l===this.lastIndex,o=l===this.maxCount;return this._setRangeLocal(r,l,t,n,o,i),!1}}return!0}},{key:"_doFetch",value:function(){var e=this;this._log("fetching next set of rows from asyncIterator"),this.callback.beforeFetchNext()?(-1===this.viewportSize&&(this.viewportSize=this.currentRenderedPoint.endIndex-this.currentRenderedPoint.startIndex),this.fetchPromise=this._fetchMoreRows().then(function(t){if(t.maxCountLimit){e._log("reached max count");var n=t.size>0?null:e.currentRenderedPoint.start,a=t.size>0?null:e.currentRenderedPoint.end;e._setRangeLocal(e.currentRenderedPoint.startIndex,e.maxCount,n,a,!0,!1),e.fetchPromise=null,e.asyncIterator=null}else if(t.size>0||!0===t.done){var r=0;e._isRenderingViewportOnly(e.callback)&&(r=e.callback.getIndexForPosition(e.currentScrollTop));var l=r,i=e.currentRenderedPoint.endIndex+t.size;t.done&&(e.lastIndex=i),e._setRangeLocal(l,i,null,null,!1,t.done)}},function(t){e.callback.fetchError(t),e.fetchPromise=null,e.nextFetchTrigger=void 0})):(this._log("fetch is aborted due to beforeFetchCallback returning false"),this.nextFetchTrigger=void 0)}},{key:"_fetchMoreRows",value:function(){var e=this;if(!this.fetchPromise){var t=this.maxCount-this.rowCount;return t>0&&!this.currentRenderedPoint.done&&null!=this.asyncIterator?(this.fetchPromise=this.asyncIterator.next().then(function(n){var a;return e.fetchPromise=null,null!=n&&(a={done:n.done,maxCountLimit:n.maxCountLimit},null!=n.value&&(a.size=n.value.data.length,e.rowCount+=n.value.data.length,t<e.fetchSize&&(a.maxCountLimit=!0,n.value.data.length>t&&(a.size=t))),a.maxCountLimit&&(e.asyncIterator=null)),Promise.resolve(a)}),this.fetchPromise):Promise.resolve({maxCount:this.maxCount,maxCountLimit:!0})}return this.fetchPromise}},{key:"_handleModelInsert",value:function(e,t){var n=this,a=this.currentRenderedPoint.keys;e.forEach(function(e,n){var r=a.indexOf(e),l=t[n];r>-1&&a.splice(r,0,l)});var r=[],l=this.currentRenderedPoint.startIndex;return t.forEach(function(e){var t=a.indexOf(e);t>-1?r.push(t+l):n.currentRenderedPoint.done=!1}),r}},{key:"_handleModelDelete",value:function(e){var t=[],n=this.currentRenderedPoint.startIndex,a=this.currentRenderedPoint.keys,r=[];return e.forEach(function(e){var l=a.indexOf(e);l>-1&&(t.push(n+l),r.push(e))}),r.forEach(function(e){a.splice(a.indexOf(e),1)}),t}},{key:"_updateRenderedPoint",value:function(e,t,n){e<t.startIndex?"added"===n?(t.startIndex=t.startIndex+1,t.endIndex=t.endIndex+1):"removed"===n&&(t.startIndex=t.startIndex-1,t.endIndex=t.endIndex-1):e<=t.endIndex&&("added"===n?t.endIndex=t.endIndex+1:"removed"===n&&(t.endIndex=t.endIndex-1))}},{key:"_handleItemsAddedOrRemoved",value:function(e,t){var n=this;e.forEach(function(e){n._updateRenderedPoint(e,n.currentRenderedPoint,t)})}},{key:"_log",value:function(e){i.info("[VirtualizeDomScroller]=> "+e)}}]),e}(),g=function(e){a(s,e);var d=l(s);function s(e,n,a,r){var l;return c(this,s),(l=d.call(this,e,n,a)).root=e,l.dataProvider=n,l.callback=a,l.scrollPolicyOptions=r,l.fetchRows=function(){if(l.isReady()){l.setFetching(!0);var e={clientId:l._clientId};e.size=l._isLoadMoreOnScroll()?l.getFetchSize():-1,l.dataProviderAsyncIterator=l.getDataProvider().fetchFirst(e)[Symbol.asyncIterator]();var t=l.addBusyState("call next on iterator"),n=l.dataProviderAsyncIterator.next(),a=e.size;n.then(function(e){return function e(t){return t.done||-1!==a||"function"==typeof l.getDataProvider().getPageCount?t:l.dataProviderAsyncIterator.next().then(function(n){return t.done=n.done,t.value.data=t.value.data.concat(n.value.data),t.value.metadata=t.value.metadata.concat(t.value.metadata),e(t)},function(e){this.fetchError(e)})}(e)},function(e){t(),l.fetchError(e)}).then(function(e){if(l.isFetching()){if(t(),null==l.callback)return;l.initialFetch=!0,l.callback.setData(e)}},function(e){t(),l.fetchError(e)})}},l._registerDomScroller=function(e){var n={fetchSize:l.getFetchSize(),maxCount:l._getMaxCount(),keys:e,strategy:l.isRenderingViewportOnly()?t.VirtualizationStrategy.VIEWPORT_ONLY:t.VirtualizationStrategy.HIGH_WATER_MARK};l.domScroller=new p(l._getScroller(),l.getDataProvider(),l.dataProviderAsyncIterator,o(l),n)},l._clientId=Symbol(),l}return f(s,[{key:"getDataProvider",value:function(){if(null==this.wrappedDataProvider){var e=this.dataProvider.getCapability("fetchCapability");null==e||null==e.caching||"none"==e.caching?this.wrappedDataProvider=new h(this.dataProvider):this.wrappedDataProvider=this.dataProvider}return this.wrappedDataProvider}},{key:"setDataProvider",value:function(e){this.wrappedDataProvider=null,this.dataProvider=e}},{key:"postRender",value:function(){this.initialFetch=!1}},{key:"destroy",value:function(){n(u(s.prototype),"destroy",this).call(this),this.domScroller&&this.domScroller.destroy()}},{key:"isRenderingViewportOnly",value:function(){return!1}},{key:"_isLoadMoreOnScroll",value:function(){return!0}},{key:"_getScroller",value:function(){var e=this.scrollPolicyOptions.scroller;return null!=e?e:this.root}},{key:"getFetchSize",value:function(){return this.scrollPolicyOptions.fetchSize}},{key:"_getMaxCount",value:function(){return this.scrollPolicyOptions.maxCount}},{key:"isInitialFetch",value:function(){return this.initialFetch}},{key:"checkViewport",value:function(){this.domScroller&&this.domScroller.checkViewport()}},{key:"renderSkeletonsForLoadMore",value:function(){}},{key:"renderFetchedData",value:function(){if(null!=this.callback){var e=[],t=this.callback.getData();if(null==t||null==t.value)return e;var n=t.value.data,a=t.value.metadata,r=void 0===t.startIndex?0:t.startIndex;if(n.length===a.length){if(e.push(this.renderData(n,a,r)),this._isLoadMoreOnScroll()){if(!t.done&&(0===n.length&&i.info("handleFetchedData: zero data returned while done flag is false"),!t.maxCountLimit)){if(null==this.domScroller){var l=a.map(function(e){return e.key});this._registerDomScroller(l)}e.push(this.renderSkeletonsForLoadMore())}t.maxCountLimit&&this._handleScrollerMaxRowCount()}return this.setFetching(!1),e}}}},{key:"beforeFetchNext",value:function(){return null==this.domScrollerFetchResolve&&(this.domScrollerFetchResolve=this.addBusyState("dom scroller call next on iterator"),!0)}},{key:"beforeFetchByOffset",value:function(e,t){return null==this.domScrollerFetchResolve&&(this.domScrollerFetchResolve=this.addBusyState("dom scroller call next on iterator")),!0}},{key:"fetchSuccess",value:function(e){this.domScrollerFetchResolve(),this.domScrollerFetchResolve=null,null!=e&&this.callback.setData(e)}},{key:"fetchError",value:function(e){this.domScrollerFetchResolve(),this.domScrollerFetchResolve=null,"notValid"!==e&&i.error("an error occurred during data fetch, reason: "+e)}},{key:"_handleScrollerMaxRowCount",value:function(){}},{key:"renderData",value:function(e,t,n){if(null==this.callback)return null;for(var a=[],r=0;r<e.length;r++)if(null!=e[r]&&null!=t[r]){if(!this.verifyKey(t[r].key)){i.error("encounted a key with invalid data type.  Acceptable data types for key are: "+this.validKeyTypes),a=[];break}var l=this.addItem(t[r].key,r+n,e[r],!0);l&&a.push(l)}return a}},{key:"_handleItemsMutated",value:function(e,t,n){this.callback.updateData(function(a){var r=this,l={startIndex:a.startIndex,done:a.done,value:{data:a.value.data.slice(0),metadata:a.value.metadata.slice(0)}},i=e.indexes,o=Array.from(e[t]);null==i&&(i=o.map(function(e){return r._findIndex(a.value.metadata,e)}));var d=isNaN(a.startIndex)?0:a.startIndex,u=Math.max(d+a.value.data.length,this.getFetchSize());return i.forEach(function(t,a){var r=o[a],i=null!=e.data?e.data[a]:null,s=null!=e.metadata?e.metadata[a]:null;t>=d&&t<=u&&n(l,r,t,i,s)}),{renderedData:l}}.bind(this))}},{key:"_findIndex",value:function(e,t){for(var n=0;n<e.length;n++)if(r.KeyUtils.equals(t,e[n].key))return n;return-1}},{key:"handleModelRefresh",value:function(){this.domScroller&&this.domScroller.destroy(),this.domScroller=null,n(u(s.prototype),"handleModelRefresh",this).call(this)}},{key:"handleItemsAdded",value:function(e){this.callback.updateData(function(t){var n={startIndex:t.startIndex,done:t.done,maxCountLimit:t.maxCountLimit,value:{data:t.value.data.slice(0),metadata:t.value.metadata.slice(0)}},a=e.indexes,r=e.addBeforeKeys,l=e.keys;if(null==a&&null==r)n.done&&!n.maxCountLimit&&(n.value.data.push(e.data),n.value.metadata.push(e.metadata));else{var i=0;l.forEach(function(){var t=e.data[i],l=e.metadata[i],o=-1;null!=a&&null!=a[i]?o=a[i]:null!=r&&null!=r[i]&&(o=this._findIndex(n.value.metadata,r[i])),o>-1&&o<n.value.data.length?(n.value.data.splice(o,0,t),n.value.metadata.splice(o,0,l)):n.done&&!n.maxCountLimit&&(n.done=!1),i++}.bind(this))}return{renderedData:n}}.bind(this)),n(u(s.prototype),"handleItemsAdded",this).call(this,e)}},{key:"handleItemsRemoved",value:function(e){var t=this;this._handleItemsMutated(e,"keys",function(e,n){var a=t._findIndex(e.value.metadata,n);a>-1&&(e.value.data.splice(a,1),e.value.metadata.splice(a,1))}),n(u(s.prototype),"handleItemsRemoved",this).call(this,e)}},{key:"handleCurrentRangeItemUpdated",value:function(e){}},{key:"handleItemsUpdated",value:function(e){var t=this;this._handleItemsMutated(e,"keys",function(e,n,a,r,l){e.value.data.splice(a,1,r),e.value.metadata.splice(a,1,l),t.handleCurrentRangeItemUpdated(n)}),n(u(s.prototype),"handleItemsUpdated",this).call(this,e)}}]),s}(y),k=function(e){a(s,e);var d=l(s);function s(e,n,a,r){var l;return c(this,s),(l=d.call(this,e,n,a)).root=e,l.dataProvider=n,l.callback=a,l.scrollPolicyOptions=r,l.fetchRows=function(){if(l.isReady()){var e={clientId:l._clientId};e.size=l._isLoadMoreOnScroll()?l.getFetchSize():-1;var t=l.getDataProvider().fetchFirst(e)[Symbol.asyncIterator]();l._cachedIteratorsAndResults.root={iterator:t,cache:null};l._fetchNextFromIterator(t,null,e,{value:{data:[],metadata:[]}}).then(function(e){l._setNewData(e)},function(){l._setNewData(null)})}},l._fetchNextFromIterator=function(e,t,n,a){if(null==e)return Promise.resolve();l.setFetching(!0);var r=l.addBusyState("call next on iterator"),i=e.next(),o=n.size;return i.then(function(t){return function t(n){return n.done||-1!==o||"function"==typeof l.getDataProvider().getPageCount?n:e.next().then(function(e){return n.done=e.done,n.value.data=n.value.data.concat(e.value.data),n.value.metadata=n.value.metadata.concat(n.value.metadata),t(n)},function(e){return Promise.reject(e)})}(t)},function(e){return Promise.reject(e)}).then(function(e){if(l.isFetching()){if(r(),l.setFetching(!1),null==l.callback||null==e)return;return l.initialFetch=!0,e.done&&l._cachedIteratorsAndResults[null===t?"root":t]&&(l._cachedIteratorsAndResults[null===t?"root":t].iterator=null),l.handleNextItemInResults(n,t,e,a)}},function(e){return r(),l._handleFetchError(e),Promise.reject(e)})},l._setNewData=function(e){null!=l.callback&&l.callback.updateData(function(t){var n,a,r;return null==e?(n=[],a=[],r=!0):(n=e.value.data,a=e.value.metadata,r=this._checkIteratorAndCache()),{renderedData:null==t?{value:{data:n,metadata:a},done:r}:{value:{data:t.value.data.concat(n),metadata:t.value.metadata.concat(a)},done:r}}}.bind(o(l)))},l._checkIteratorAndCache=function(){var e=l._cachedIteratorsAndResults,t=Object.keys(e).map(function(t){return e[t]}),n=!0;return t.forEach(function(e){!e||null==e.iterator&&null==e.cache||(n=!1)}),n},l.fetchMoreRows=function(){if(l.isReady()){var e=l._getLastEntryMetadata(),t=e.key;!e.isLeaf&&l._isExpanded(t)||(t=e.parentKey);var n={};n.size=l._isLoadMoreOnScroll()?l.getFetchSize():-1;var a=l._cachedIteratorsAndResults[null===t?"root":t],r=null;null!=a&&(r=a.cache,a.iterator);var i={value:{data:[],metadata:[]}};return l.handleNextItemInResults(n,t,r,i).then(function(){var e,a=l._cachedIteratorsAndResults[null===t?"root":t];return null!=a&&(e=a.iterator),l._fetchFromAncestors(n,t,e,i)},function(e){return Promise.reject(e)})}return Promise.resolve()},l._fetchFromAncestors=function(e,t,n,a){var r=o(l);if(r._checkFinalResults(e,a))return a.done=l._checkIteratorAndCache(),Promise.resolve(a);return l._fetchNextFromIterator(n,t,e,a).then(function(t,n){if(r._checkFinalResults(e,n)||null===t)return n.done=this._checkIteratorAndCache(),Promise.resolve(n);var a=r._getItemByKey(t,n).metadata.parentKey,l=this._cachedIteratorsAndResults[null===a?"root":a],i=null,o=null;return null!=l&&(i=l.cache,o=l.iterator),this.handleNextItemInResults(e,a,i,n).then(this._fetchFromAncestors.bind(this,e,a,o,n))}.bind(o(l),t,a),function(e){return Promise.reject(e)})},l._getLastEntryMetadata=function(){var e=l.callback.getData();if(e&&e.value.metadata.length){var t=e.value.metadata;return t[t.length-1]}return null},l._isExpanded=function(e){return l.callback.getExpanded().has(e)},l.getChildDataProvider=function(e){return null==e?l.dataProvider:l.dataProvider.getChildDataProvider(e)},l.handleNextItemInResults=function(e,t,n,a){if(null===n||0===n.value.data.length||l._checkFinalResults(e,a))return null!=n&&n.value.data.length?l._cachedIteratorsAndResults[null===t?"root":t]&&(l._cachedIteratorsAndResults[null===t?"root":t].cache=n):l._cachedIteratorsAndResults[null===t?"root":t]&&(l._cachedIteratorsAndResults[null===t?"root":t].cache=null),l._checkFinalResults(e,a)||null==l._cachedIteratorsAndResults[null===t?"root":t].iterator?(a.done=l._checkIteratorAndCache(),Promise.resolve(a)):l._fetchNextFromIterator(l._cachedIteratorsAndResults[null===t?"root":t].iterator,t,e,a);var r=n.value.data.shift(),i=n.value.metadata.shift(),d=l._updateMetadata(i,t,a);if(a.value.data.push(r),a.value.metadata.push(d),l._isExpanded(d.key)){var u=l.getChildDataProvider(d.key);if(null!=u){var s={clientId:l._clientId};s.size=l._isLoadMoreOnScroll()?l.getFetchSize():-1;var c=u.fetchFirst(s)[Symbol.asyncIterator]();return l._cachedIteratorsAndResults[null===d.key?"root":d.key]={iterator:c,cache:null},l._fetchNextFromIterator(c,d.key,s,a).then(l.handleNextItemInResults.bind(o(l),s,t,n,a))}}return l.handleNextItemInResults(e,t,n,a)},l._checkFinalResults=function(e,t){return t.value.data.length>=e.size&&-1!==e.size},l._updateMetadata=function(e,t,n){var a=0,r=l._getLastItemByParentKey(t,n),i=null==r?0:r.metadata.indexFromParent+1,o=null===l.getChildDataProvider(e.key);null!=t&&(a=l._getItemByKey(t,n).metadata.treeDepth+1);var d=l._isExpanded(e.key);return{key:e.key,isLeaf:o,parentKey:t,indexFromParent:i,treeDepth:a,expanded:d}},l._getIndexByKey=function(e,t){var n=-1;return t.some(function(t,a){if(t.key===e)return n=a,!0}),n},l._getLastItemByParentKey=function(e,t){var n=null;if(t&&t.value.metadata.slice().reverse().some(function(a,r){if(a.parentKey===e)return n={data:t.value.data[r],metadata:a},!0}),n)return n;var a=l.callback.getData();return a&&a.value.metadata.slice().reverse().some(function(t,r){if(t.parentKey===e)return n={data:a.value.data[r],metadata:t},!0}),n},l._getItemByKey=function(e,t){var n=null;if(t&&t.value.metadata.some(function(a,r){if(a.key===e)return n={data:t.value.data[r],metadata:a},!0}),n)return n;var a=l.callback.getData();return a&&a.value.metadata.some(function(t,r){if(t.key===e)return n={data:a.value.data[r],metadata:t},!0}),n},l.expand=function(e){var t=l.getChildDataProvider(e);if(null!==t){var n=setTimeout(function(){this.callback.getExpandingKeys().has(e)&&this.callback.updateSkeletonKeys(e)}.bind(o(l)),250),a=l.getFetchSize(),r={clientId:l._clientId,size:a},i=t.fetchFirst(r)[Symbol.asyncIterator]();return l._cachedIteratorsAndResults[e]={iterator:i,cache:null},l._fetchNextFromIterator(i,e,r,{value:{data:[],metadata:[]}}).then(function(t){null!=this.callback&&this.callback.updateExpand(function(r,l,i,o){if(n&&clearTimeout(n),l.has(e)&&(l=l.delete([e])),!i.has(e)||!o.has(e))return{expandedSkeletonKeys:l};if(null==t)return{expandedSkeletonKeys:l,expandingKeys:i.delete([e])};var d,u,s,c=t.value.data,h=t.value.metadata;if(r){var f=r.value.data,v=r.value.metadata,m=this._getIndexByKey(e,v);if(-1!==m){var y=c.length,p=f.slice(0,m+1).concat(c),g=v.slice(0,m+1).concat(h),k=r.done;y<a?(p=p.concat(f.slice(m+1)),g=g.concat(v.slice(m+1))):(u=f.slice(m+1),s=v.slice(m+1),u.length>0&&(k=!1,null!=this.domScroller&&this.domScroller.setAsyncIterator({next:this.fetchMoreRows.bind(this)}))),d={value:{data:p,metadata:g},done:k}}}return null==d&&(d={value:{data:c,metadata:h},done:!0}),null!=u&&this._recacheData(u,s),{expandedSkeletonKeys:l,expandingKeys:i=i.delete([e]),renderedData:d}}.bind(this))}.bind(o(l)))}},l._recacheData=function(e,t){for(var n=e.length-1;n>=0;n--){var a=e[n],r=t[n],i=r.parentKey,o=l._cachedIteratorsAndResults[null===i?"root":i].cache;null==o?l._cachedIteratorsAndResults[null===i?"root":i].cache={done:!1,value:{data:[a],metadata:[r]}}:(o.value.data.unshift(a),o.value.metadata.unshift(r))}},l._getLocalDescendentCount=function(e,t){for(var n=0,a=e[t].treeDepth,r=e.length,l=t+1;l<r;l++){if(!(e[l].treeDepth>a))return n;n+=1}return n},l._registerDomScroller=function(){var e={asyncIterator:{next:l.fetchMoreRows.bind(o(l))},fetchSize:l.getFetchSize(),fetchTrigger:l.callback.getSkeletonHeight()*l.getLoadMoreCount(),maxCount:l._getMaxCount(),initialRowCount:l.getFetchSize(),strategy:t.VirtualizationStrategy.HIGH_WATER_MARK,isOverflow:l._getOverflowFunc(),success:l.handleFetchSuccess.bind(o(l)),error:function(){l._setNewData(null)},beforeFetch:function(){return l.handleBeforeFetchNext()},beforeFetchByOffset:function(){l.handleBeforeFetchByOffset()}};l.domScroller=new v(l._getScroller(),l.getDataProvider(),e)},l.getLoadMoreCount=function(){return 0},l._getOverflowFunc=function(){return l._getScroller()!==l.root?l._isLastItemInViewport.bind(o(l)):null},l._isLastItemInViewport=function(){var e="."+l.callback.getItemStyleClass()+", ."+l.callback.getGroupStyleClass(),t=l.root.querySelectorAll(e),n=t[t.length-1];if(n){var a=n.getBoundingClientRect();if(a.top>=0&&a.bottom<=document.documentElement.clientHeight)return!1}return!0},l._cachedIteratorsAndResults={},l._clientId=Symbol(),l}return f(s,[{key:"postRender",value:function(){this.initialFetch=!1}},{key:"destroy",value:function(){n(u(s.prototype),"destroy",this).call(this),this.domScroller&&this.domScroller.destroy()}},{key:"_isLoadMoreOnScroll",value:function(){return!0}},{key:"_getScroller",value:function(){var e=this.scrollPolicyOptions.scroller;return null!=e?e:this.root}},{key:"getFetchSize",value:function(){return this.scrollPolicyOptions.fetchSize}},{key:"_getMaxCount",value:function(){return this.scrollPolicyOptions.maxCount}},{key:"isInitialFetch",value:function(){return this.initialFetch}},{key:"renderSkeletonsForLoadMore",value:function(){}},{key:"renderSkeletonsForExpand",value:function(e){}},{key:"renderFetchedData",value:function(){if(null!=this.callback){var e=this._renderOutOfRangeData(),t=this.callback.getData();if(null==t||null==t.value)return e;var n=t.value.data,a=t.value.metadata;return n.length===a.length?(e.push(this.renderData(n,a)),this._isLoadMoreOnScroll()&&(t.done||(0===n.length&&i.info("handleFetchedData: zero data returned while done flag is false"),t.maxCountLimit||(null==this.domScroller&&this._registerDomScroller(),e.push(this.renderSkeletonsForLoadMore()))),t.maxCountLimit&&this._handleScrollerMaxRowCount()),e):void 0}}},{key:"handleBeforeFetchNext",value:function(){return!this.isFetching()}},{key:"handleBeforeFetchByOffset",value:function(){}},{key:"handleFetchSuccess",value:function(e){null!=e&&this._setNewData(e)}},{key:"_handleFetchError",value:function(e){this.setFetching(!1),i.error("iterating dataprovider content handler fetch error :"+e)}},{key:"_handleScrollerMaxRowCount",value:function(){}},{key:"renderData",value:function(e,t){if(null==this.callback)return null;for(var n=[],a=this.callback.getSkeletonKeys(),r=0;r<e.length;r++)if(null!=e[r]&&null!=t[r]){if(!this.verifyKey(t[r].key)){i.error("encounted a key with invalid data type.  Acceptable data types for key are: "+this.validKeyTypes),n=[];break}var l=this.addItem(t[r],r,e[r],!0);l&&(n.push(l),a.has(t[r].key)&&n.push(this.renderSkeletonsForExpand(t[r].key)))}return n}},{key:"_renderOutOfRangeData",value:function(){return[]}},{key:"_handleItemsMutated",value:function(e,t,n,a){null!=this.callback&&this.callback.updateData(function(r,l){var i=this,o=l,d={startIndex:r.startIndex,done:r.done,value:{data:r.value.data.slice(0),metadata:r.value.metadata.slice(0)}},u=Array.from(e[t]),s=u.map(function(e){return i._findIndex(r.value.metadata,e)});this.domScroller&&n(s);var c=isNaN(r.startIndex)?0:r.startIndex,h=Math.max(c+r.value.data.length,this.getFetchSize()),f=!1;if(s.forEach(function(t,n){var r=u[n],l=null!=e.data?e.data[n]:null,i=null!=e.metadata?e.metadata[n]:null;if(t>=c&&t<=h){var s=a(d,r,t,l,i,o);null!=s&&(o=s),f=!0}}),f)return o!==l?{renderedData:d,expandingKeys:o}:{renderedData:d}}.bind(this))}},{key:"_findIndex",value:function(e,t){for(var n=0;n<e.length;n++)if(r.KeyUtils.equals(t,e[n].key))return n;return-1}},{key:"handleModelRefresh",value:function(){this.domScroller&&this.domScroller.destroy(),this.domScroller=null,this._cachedIteratorsAndResults={},n(u(s.prototype),"handleModelRefresh",this).call(this)}},{key:"handleItemsAdded",value:function(e){null!=this.callback&&(this.callback.updateData(function(t,n){var a,r={startIndex:t.startIndex,done:t.done,maxCountLimit:t.maxCountLimit,value:{data:t.value.data.slice(0),metadata:t.value.metadata.slice(0)}},l=e.indexes,i=e.addBeforeKeys,o=e.parentKeys,d=[];return null==l&&null==i&&null==o?r.done&&!r.maxCountLimit&&(r.value.data.push(e.data),a=this._updateMetadata(e.metadata,null,r),r.value.metadata.push(a)):null!=o&&(null==l&&(l=[]),o.forEach(function(t,n){var o=e.data[n],u=e.metadata[n],s=-1;if(null===t||this._isExpanded(t)&&this._getItemByKey(t))if(null!=i)if(null!=i[n]){s=this._findIndex(r.value.metadata,i[n])}else{var c=this._getLastItemByParentKey(t,r);if(c&&(s=this._findIndex(r.value.metadata,c.metadata.key))>-1&&(s+=1),null==c||-1===s)return}else if(null!=l){var h=this._findIndex(r.value.metadata,t);s=-1===h?l[n]+1:h+l[n]+1}else s=this._findIndex(r.value.metadata,this._getLastItemByParentKey(t).metadata.key)+1;s>-1?(r.value.data.splice(s,0,o),a=this._updateMetadata(u,t,r),r.value.metadata.splice(s,0,a),-1===l.indexOf(s)&&l.push(s),this._isExpanded(u.key)&&d.push(u.key)):r.done&&!r.maxCountLimit&&(r.value.data.push(o),r.value.metadata.push(u))}.bind(this))),this.domScroller&&this.domScroller.handleItemsAdded&&this.domScroller.handleItemsAdded(l),{expandingKeys:n.add(d),renderedData:r}}.bind(this)),n(u(s.prototype),"handleItemsAdded",this).call(this,e))}},{key:"handleItemsRemoved",value:function(e){var t=this;this._handleItemsMutated(e,"keys",function(e){t.domScroller.handleItemsRemoved&&t.domScroller.handleItemsRemoved(e)},function(e,n){var a=t._findIndex(e.value.metadata,n);if(a>-1){var r=t._getLocalDescendentCount(e.value.metadata,a)+1;e.value.data.splice(a,r),e.value.metadata.splice(a,r)}}),n(u(s.prototype),"handleItemsRemoved",this).call(this,e)}},{key:"handleCurrentRangeItemUpdated",value:function(){}},{key:"handleItemsUpdated",value:function(e){var t=this;this._handleItemsMutated(e,"keys",function(e){t.domScroller.handleItemsUpdated&&t.domScroller.handleItemsUpdated(e)},function(e,n,a,r,l,i){var o=e.value.metadata[a],d=o.isLeaf,u=t._updateMetadata(l,o.parentKey,{value:{data:[r],metadata:[l]}});return d&&!u.isLeaf&&(i=i.add([u.key])),e.value.data.splice(a,1,r),e.value.metadata.splice(a,1,u),t.handleCurrentRangeItemUpdated(),i}),n(u(s.prototype),"handleItemsUpdated",this).call(this,e)}},{key:"checkViewport",value:function(){if(this.domScroller&&this.isReady()){var e=this.domScroller.checkViewport();null!=e&&this.fetchPromise!==e&&(this.fetchPromise=e,e.then(function(e){this.fetchPromise=null,null!=e&&this.handleFetchSuccess(e)}.bind(this)))}}},{key:"collapse",value:function(e){e.forEach(function(e){null!=this._cachedIteratorsAndResults[e]&&(this._cachedIteratorsAndResults[e].iterator=null,this._cachedIteratorsAndResults[e].cache=null)}.bind(this))}}]),s}(y),_=function(e){a(n,e);var t=l(n);function n(){return c(this,n),t.apply(this,arguments)}return n}(e(HTMLElement));t.IteratingDataProviderContentHandler=g,t.IteratingTreeDataProviderContentHandler=k,t.KeyedElement=_,t.VirtualizeDomScroller=p,Object.defineProperty(t,"__esModule",{value:!0})})}();
//# sourceMappingURL=ojvcollection.js.map