/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
define(["exports","ojs/ojvcomponent-element"],function(t,e){"use strict";var h=function(t,e,h,i){var r,s=arguments.length,n=s<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,h):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,h,i);else for(var l=t.length-1;l>=0;l--)(r=t[l])&&(n=(s<3?r(n):s>3?r(e,h,n):r(e,h))||n);return s>3&&n&&Object.defineProperty(e,h,n),n};t.HighlightText=class extends e.ElementVComponent{constructor(t){super(t),this._HIGHLIGHT_TOKEN="__@@__"}render(){const t=this.props,h=this._highlighter(t.text,t.matchText);return e.h("oj-highlight-text",{class:"oj-highlighttext"},h)}_highlighter(t,h){if(h){const i=this._escapeRegExp(h),r=t.replace(new RegExp(i,"gi"),this._HIGHLIGHT_TOKEN+"$&"+this._HIGHLIGHT_TOKEN).split(this._HIGHLIGHT_TOKEN).map((t,h)=>h%2==0?t:e.h("span",{class:"oj-highlighttext-highlighter"},t));return e.h("span",null,r)}return e.h("span",null,t)}_escapeRegExp(t){return t.replace(/[.*+\-?^${}()|[\]\\]/g,"\\$&")}},t.HighlightText.metadata={extension:{_DEFAULTS:class{constructor(){this.text="",this.matchText=""}}},properties:{text:{type:"string",value:""},matchText:{type:"string",value:""}}},t.HighlightText=h([e.customElement("oj-highlight-text")],t.HighlightText),Object.defineProperty(t,"__esModule",{value:!0})});
//# sourceMappingURL=ojhighlighttext.js.map