"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const color_util_1 = require("../util/color-util");
const extractor_mixin_1 = require("../extractor-mixin");
class ColorExtractor extends extractor_mixin_1.Extractor {
    async extract(fileLines) {
        const colors = await Promise.all(this.enabledStrategies.map(strategy => strategy.extractColors(fileLines)));
        return color_util_1.flattenLineExtractionsFlatten(colors); // should regroup per lines?
    }
    extractOneColor(text) {
        const colors = this.enabledStrategies.map(strategy => strategy.extractColor(text));
        return colors.find(color => color !== null);
    }
}
const instance = new ColorExtractor();
exports.default = instance;
//# sourceMappingURL=color-extractor.js.map