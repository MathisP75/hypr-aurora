"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ColorStrategy {
    constructor(name, REGEXP, REGEXP_ONE, colorFromRegexp) {
        this.name = name;
        this.REGEXP = REGEXP;
        this.REGEXP_ONE = REGEXP_ONE;
        this.colorFromRegexp = colorFromRegexp;
    }
    async extractColors(fileLines) {
        return fileLines.map(({ line, text }) => {
            let match = null;
            const colors = [];
            while ((match = this.REGEXP.exec(text)) !== null) {
                const color = this.colorFromRegexp(match);
                if (color) {
                    colors.push(color);
                }
            }
            return {
                line,
                colors
            };
        });
    }
    extractColor(text) {
        const match = this.REGEXP_ONE.exec(text);
        if (match) {
            return this.colorFromRegexp(match);
        }
        return null;
    }
}
exports.default = ColorStrategy;
//# sourceMappingURL=__strategy-base.js.map