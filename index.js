"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@logseq/libs");
var axios_1 = __importDefault(require("axios"));
var endpoints_config_1 = __importDefault(require("./endpoints.config"));
var handle_tasks_1 = __importDefault(require("./handle-tasks"));
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log('Plugin loaded');
        logseq.provideModel({
            pullActiveTaks: function () { return __awaiter(void 0, void 0, void 0, function () {
                var currentPage, targetBlock, tasksWithPrefix, tasksWithoutPrefix, tasksContentArr, tasksIdArr, e_1, _i, tasksIdArr_1, i, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, logseq.Editor.getCurrentPage()];
                        case 1:
                            currentPage = _a.sent();
                            if (!(currentPage && currentPage['journal?'] == true)) return [3 /*break*/, 17];
                            return [4 /*yield*/, logseq.Editor.insertBlock(currentPage.name, '[[Tasks Inbox]]', {
                                    isPageBlock: true,
                                })];
                        case 2:
                            targetBlock = _a.sent();
                            return [4 /*yield*/, handle_tasks_1.default.handleTasksWithPrefix()];
                        case 3:
                            tasksWithPrefix = _a.sent();
                            return [4 /*yield*/, handle_tasks_1.default.handleTasksWithoutPrefix()];
                        case 4:
                            tasksWithoutPrefix = _a.sent();
                            if (!(!tasksWithPrefix && !tasksWithoutPrefix)) return [3 /*break*/, 5];
                            logseq.App.showMsg('There are no tasks in your indicated project(s).');
                            return [2 /*return*/];
                        case 5:
                            if (!(tasksWithPrefix && tasksWithoutPrefix)) return [3 /*break*/, 16];
                            tasksContentArr = __spreadArray(__spreadArray([], tasksWithPrefix.withPrefixArr, true), tasksWithoutPrefix.withoutPrefixArr, true);
                            tasksIdArr = __spreadArray(__spreadArray([], tasksWithPrefix.tasksIdWithPrefixArr, true), tasksWithoutPrefix.tasksIdWithoutPrefixArr, true);
                            _a.label = 6;
                        case 6:
                            _a.trys.push([6, 9, , 10]);
                            if (!targetBlock) return [3 /*break*/, 8];
                            // Insert tasks below header block
                            return [4 /*yield*/, logseq.Editor.insertBatchBlock(targetBlock.uuid, tasksContentArr, {
                                    sibling: !parent,
                                    before: true,
                                })];
                        case 7:
                            // Insert tasks below header block
                            _a.sent();
                            _a.label = 8;
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            e_1 = _a.sent();
                            logseq.App.showMsg('There is an error inserting your tasks. No tasks have been removed from Todoist.');
                            return [2 /*return*/];
                        case 10:
                            _a.trys.push([10, 15, , 16]);
                            _i = 0, tasksIdArr_1 = tasksIdArr;
                            _a.label = 11;
                        case 11:
                            if (!(_i < tasksIdArr_1.length)) return [3 /*break*/, 14];
                            i = tasksIdArr_1[_i];
                            console.log("Clearing " + i);
                            return [4 /*yield*/, (0, axios_1.default)({
                                    url: "https://api.todoist.com/rest/v1/tasks/" + i + "/close",
                                    method: 'POST',
                                    headers: {
                                        Authorization: "Bearer " + endpoints_config_1.default.apiToken,
                                    },
                                })];
                        case 12:
                            _a.sent();
                            _a.label = 13;
                        case 13:
                            _i++;
                            return [3 /*break*/, 11];
                        case 14: return [3 /*break*/, 16];
                        case 15:
                            e_2 = _a.sent();
                            logseq.App.showMsg('There is an error removing your tasks from Todoist. Please remove them directly from Todoist.');
                            return [2 /*return*/];
                        case 16: return [3 /*break*/, 18];
                        case 17:
                            // Display error message if trying to add reflection on non-Journal page
                            logseq.App.showMsg('This function is only available on a Journal page');
                            _a.label = 18;
                        case 18: return [2 /*return*/];
                    }
                });
            }); },
        });
        // Register UI
        logseq.App.registerUIItem('toolbar', {
            key: 'logseq-todoist-plugin',
            template: "\n      <a data-on-click=\"pullActiveTaks\"\n        class=\"button\">\n        <i class=\"ti ti-checkbox\"></i>\n      </a>\n",
        });
        return [2 /*return*/];
    });
}); };
logseq.ready(main).catch(console.error);
