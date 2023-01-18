"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Color {
    /**
     * Creates an instance of Color.
     *
     * @param {string} value
     * @param {number} [positionInText=0]
     * @param {number} [alpha=1]
     * @param {number[]} rgb
     *
     * @memberOf Color
     */
    constructor(value, positionInText = 0, rgb, alpha) {
        this.value = value;
        this.positionInText = positionInText;
        this.alpha = alpha !== null && alpha !== void 0 ? alpha : 1;
        this.rgb = rgb;
    }
    /**
     * Generate the color string rgb representation
     * example :
     *  #fff => rgb(255, 255, 255)
     *  rgba(1, 34, 12, .1) => rgb(1, 34, 12)
     *
     * @returns {string}
     * @public
     * @memberOf Color
     */
    toRgbString() {
        return `rgb(${this.rgb.join(', ')})`;
    }
    /**
     * Generate the color string rgb representation
     * example :
     *  #fff => rgb(255, 255, 255)
     *  rgba(1, 34, 12, .1) => rgb(1, 34, 12)
     *
     * @returns {string}
     * @public
     * @memberOf Color
     */
    toRgbaString() {
        return `rgba(${this.rgb.join(', ')}, ${this.alpha})`;
    }
}
exports.default = Color;
//# sourceMappingURL=color.js.map