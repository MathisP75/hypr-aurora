/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
define(["ojs/ojoption","touchr","ojs/ojcore-base","jquery","ojs/ojdomutils","ojs/ojcontext","ojs/ojconfig","ojs/ojoffcanvas","ojs/ojswipetoreveal","ojs/ojcustomelement-utils"],function(e,t,n,s,o,i,a,c,r,l){"use strict";
/**
   * @license
   * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
   * The Universal Permissive License (UPL), Version 1.0
   * as shown at https://oss.oracle.com/licenses/upl/
   * @ignore
   */var u;n=n&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n,s=s&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s,i=i&&Object.prototype.hasOwnProperty.call(i,"default")?i.default:i,(u={properties:{translations:{type:"object",value:{},properties:{ariaHideActionsDescription:{type:"string"},ariaShowEndActionsDescription:{type:"string"},ariaShowStartActionsDescription:{type:"string"}}}},methods:{getProperty:{},refresh:{},setProperties:{},setProperty:{},getNodeBySubId:{},getSubIdByNode:{}},events:{ojAction:{}},extension:{}}).extension._WIDGET_NAME="ojSwipeActions",n.CustomElementBridge.register("oj-swipe-actions",{metadata:u}),n.__registerWidget("oj.ojSwipeActions",s.oj.baseComponent,{version:"1.0.0",defaultElement:"<div>",widgetEventPrefix:"oj",options:{action:null},_ComponentCreate:function(){var e,t=this,n=!1,o=!1;this._super(),this.element.uniqueId(),this.element[0].classList.add("oj-swipeactions","oj-component"),this.element[0].setAttribute("tabIndex","-1"),this._on(!0,{keydown:function(s){27===s.keyCode?(e=s.target.parentNode.parentNode).classList.contains("oj-offcanvas-open")&&(t._close({selector:e,_animate:!1}),s.preventDefault()):13===s.keyCode&&s.target.classList.contains("oj-swipeactions-action-panel")&&(n=!0)},keyup:function(e){13===e.keyCode&&n&&t._handleAction(e),n=!1},click:function(e){this.m_content&&!this.m_content.contains(e.target)&&(t._handleAction(e),e.stopPropagation())},ojdefaultaction:function(e,n){var i=s(n.selector).children("oj-option.oj-swipetoreveal-default");i.length>0&&(t._fireActionEvent(i[0],null),o=!0)},ojopen:function(e,n){o&&t._close(n),o=!1,t._updateOptionClass(e.target,".oj-sm-align-self-center","oj-flex-bar-center-absolute"),t._releaseBusyState()},ojclose:function(e,n){var o=s(n.selector).children(".oj-swipeactions-hide-actions-link");o.length>0&&o[0].parentNode.removeChild(o[0]);var i=this._getOptionClass(e.target);t._updateOptionClass(e.target,".oj-flex-bar-center-absolute",i),t._releaseBusyState()}}),this._focusable({applyHighlight:!0,setupHandlers:function(e,n){t._focusInHandler=e,t._focusOutHandler=n}}),this._setup()},_releaseBusyState:function(){this.busyStateResolve&&(this.busyStateResolve(),this.busyStateResolve=null)},_close:function(e){var t=i.getContext(this.element[0]).getBusyContext().addBusyState({description:"closing offcanvas"});c.close(e).then(function(){t()})},_handleAction:function(e){var t=s(e.target).parents("oj-option");t.length>0&&(this._fireActionEvent(t[0],e),this._close({selector:t[0].parentNode}))},_SetupResources:function(){this._super(),this._setupOrReleaseOffcanvas(r.tearDownSwipeActions),this._setupOrReleaseOffcanvas(r.setupSwipeActions)},_ReleaseResources:function(){this._super(),this._setupOrReleaseOffcanvas(r.tearDownSwipeActions),this._releaseBusyState()},_setupOrReleaseOffcanvas:function(e){this._applyOffcanvas("oj-offcanvas-start",e),this._applyOffcanvas("oj-offcanvas-end",e)},_closeAllOffcanvas:function(){var e=this,t=function(t){e._close({selector:t})};this._applyOffcanvas("oj-offcanvas-start",t),this._applyOffcanvas("oj-offcanvas-end",t)},_applyOffcanvas:function(e,t){var n=this.element[0].querySelector("."+e);n&&t(n)},_fireActionEvent:function(e,t){var n={};t&&(n.originalEvent=t instanceof s.Event?t.originalEvent:t);var i={detail:n,cancelable:!0,bubbles:!0};o.dispatchEvent(e,new CustomEvent("ojAction",i))},refresh:function(){this._super(),this._releaseBusyState(),this._setupOrReleaseOffcanvas(r.tearDownSwipeActions),this._setup(),this._setupOrReleaseOffcanvas(r.setupSwipeActions)},_createOffcanvas:function(e,t){var n=e[t];if(n&&n.length>0&&"TEMPLATE"===n[0].tagName){var s=document.createElement("div");s.className="start"===t?"oj-offcanvas-start":"oj-offcanvas-end",this.element[0].appendChild(s),this._renderAccessibleLink(s)}},_setup:function(){var e=this;this.element[0].classList.add("oj-offcanvas-inner-wrapper"),this.element[0].parentNode.classList.add("oj-offcanvas-outer-wrapper");var t=l.CustomElementUtils.getSlotMap(this.element[0]),n=t[""];n&&n.length>0&&(this.m_content=n[0],this.m_content.classList.add("oj-swipeactions-content")),this._createOffcanvas(t,"start"),this._createOffcanvas(t,"end"),s(this.element).on("ojpanstart",function(t){t.isDefaultPrevented()||e._renderOffcanvas(t.target)}),s(this.element).on("ojpanend",function(){var t=i.getContext(e.element[0]).getBusyContext();e.busyStateResolve=t.addBusyState({description:"opening or closing offcanvas"})})},_renderOffcanvas:function(e,t){var n=this;e.setAttribute("role","toolbar"),e.setAttribute("data-oj-context","");var s=l.CustomElementUtils.getSlotMap(this.element[0]),o=e.classList.contains("oj-offcanvas-start")?s.start[0]:s.end[0],c=i.getContext(n.element[0]).getBusyContext(),r=c.addBusyState({description:"rendering ojoptions"});a.__getTemplateEngine().then(function(s){n._render(s,e,o),t?(c=i.getContext(e).getBusyContext()).whenReady().then(function(){t(),r()}):r()},function(e){throw r(),new Error("Error loading template engine: "+e)})},_showAccessibleLinks:function(){for(var e=0,t=this.element[0].querySelectorAll("a.oj-helper-hidden-accessible"),n=0;n<t.length;n++)t[n].style.left=e+"px",t[n].className="oj-swipeactions-accessible-link",e=e+t[n].offsetWidth+5},_hideAccessibleLinks:function(){for(var e=this.element[0].querySelectorAll("a.oj-swipeactions-accessible-link"),t=0;t<e.length;t++)e[t].className="oj-helper-hidden-accessible"},_isIE11:function(){var e=n.AgentUtils.getAgentInfo();return"ie"===e.browser&&11===e.browserVersion},_renderAccessibleLink:function(e){var t=!1,o=this,a=document.createElement("a");a.setAttribute("tabIndex","0"),a.setAttribute("href","#"),a.textContent=this.getTranslatedString(e.classList.contains("oj-offcanvas-start")?"ariaShowStartActionsDescription":"ariaShowEndActionsDescription");var r=n.AgentUtils.getAgentInfo().os===n.AgentUtils.OS.ANDROID;r?(a.style.color="transparent",a.className="oj-swipeactions-accessible-link",e.classList.contains("oj-offcanvas-end")&&null!=this.element[0].querySelector("a.oj-swipeactions-accessible-link")&&(a.style.right="0px"),a.addEventListener("touchstart",function(e){t=e.touches[0].force>0},{passive:!0})):a.className="oj-helper-hidden-accessible",a.addEventListener("focus",function(){r||o._showAccessibleLinks(),o._closeAllOffcanvas()}),a.addEventListener("blur",function(e){null==e.relatedTarget||e.relatedTarget.classList.contains("oj-swipeactions-accessible-link")?null==e.relatedTarget&&o._isIE11()&&setTimeout(function(){document.activeElement.classList.contains("oj-swipeactions-accessible-link")||o._hideAccessibleLinks()},0):setTimeout(function(){r||o._hideAccessibleLinks()},0)}),a.addEventListener("click",function(n){t||(n.preventDefault(),o._renderOffcanvas(e,function(){s(e).children("oj-option").addClass("oj-swipetoreveal-action").children().attr("tabIndex",0);var t={};t.selector=e,t.autoDismiss="none",t._animate=!1;var n=document.createElement("a");n.className="oj-swipeactions-hide-actions-link",n.setAttribute("tabIndex","0"),n.setAttribute("href","#"),n.setAttribute("aria-label",o.getTranslatedString("ariaHideActionsDescription")),n.addEventListener("click",function(){o._close(t)}),r&&n.addEventListener("touchend",function(){o._close(t)});var a=i.getContext(o.element[0]).getBusyContext().addBusyState({description:"opening offcanvas"});c.open(t).then(function(){e.appendChild(n),a()})}))}),this.element[0].appendChild(a)},_render:function(e,t,n){var o=this;s(t).children("oj-option").remove();var i=[];e.execute(this.element[0],n,null).forEach(function(e){"OJ-OPTION"===e.tagName&&i.push(e)}),i.forEach(function(e){e.customOptionRenderer=o._customOptionRenderer.bind(o),t.appendChild(e)})},_customOptionRenderer:function(e){var t=this;if(!(s(e).children("div").length>0)){e.setAttribute("role","button"),e.classList.contains("oj-swipeactions-default")&&e.classList.add("oj-swipetoreveal-default");var n=document.createElement("div");n.className="oj-flex-bar oj-swipeactions-action-panel",n.addEventListener("focus",function(){t._focusInHandler(s(n))}),n.addEventListener("blur",function(){t._focusOutHandler(s(n))});var o=document.createElement("div");o.className=this._getOptionClass(e.parentElement),n.appendChild(o);var i=document.createElement("div");i.className="oj-flex oj-sm-flex-direction-column",o.appendChild(i);var a=l.CustomElementUtils.getSlotMap(e),c=a.startIcon;c&&c.forEach(function(e){i.appendChild(e)});var r=a[""];if(r){var u=document.createElement("div");u.className="oj-flex-item oj-swipeactions-action-text",i.appendChild(u),r.forEach(function(e){u.appendChild(e)})}s(e).prepend(n)}},_updateOptionClass:function(e,t,n){e.querySelectorAll(t).forEach(function(e){e.className=n})},_getOptionClass:function(e){return e.classList.contains("oj-offcanvas-end")?"oj-flex-bar-start oj-sm-align-self-center":"oj-flex-bar-end oj-sm-align-self-center"},_doAction:function(e){return new Promise(function(t){var n=this.element[0].querySelector('oj-option[value="'+e+'"');if(null!=n)this._fireActionEvent(n,null),t();else{var s=this.element[0].querySelector(".oj-offcanvas-start");null!=s&&0===s.childElementCount&&void 0===s._checked||null!=(s=this.element[0].querySelector(".oj-offcanvas-end"))&&0===s.childElementCount&&void 0===s._checked?(s._checked=!0,this._renderOffcanvas(s,function(){this._doAction(e),t()}.bind(this))):t()}}.bind(this))},_destroy:function(){this.element[0].removeEventListener("touchstart",this._touchstartListener,{passive:!1}),delete this._touchstartListener}})});
//# sourceMappingURL=ojswipeactions.js.map