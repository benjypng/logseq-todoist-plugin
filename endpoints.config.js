"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    projectIdWithoutPrefix: (_a = process.env.PROJECT_ID_WITHOUT_PREFIX) !== null && _a !== void 0 ? _a : '',
    projectIdWithPrefix: (_b = process.env.PROJECT_ID_WITH_PREFIX) !== null && _b !== void 0 ? _b : '',
    apiToken: (_c = process.env.API_TOKEN) !== null && _c !== void 0 ? _c : '',
};
