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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@logseq/libs");
var axios_1 = __importDefault(require("axios"));
var endpoints_config_1 = __importDefault(require("./endpoints.config"));
var handleTasksWithoutPrefix = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response, withoutPrefixArr, subTasks, _i, withoutPrefixArr_1, m, _a, subTasks_1, s, tasksIdWithoutPrefixArr, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!endpoints_config_1.default.projectIdWithoutPrefix) return [3 /*break*/, 5];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.get('https://api.todoist.com/rest/v1/tasks', {
                        params: { project_id: endpoints_config_1.default.projectIdWithoutPrefix },
                        headers: {
                            Authorization: "Bearer " + endpoints_config_1.default.apiToken,
                        },
                    })];
            case 2:
                response = _b.sent();
                withoutPrefixArr = response.data
                    .filter(function (t) {
                    return !t.parent_id;
                })
                    .map(function (t) { return ({
                    todoist_id: t.id,
                    content: "TODO " + t.content,
                    children: [],
                }); });
                subTasks = response.data
                    .filter(function (t) {
                    return t.parent_id;
                })
                    .map(function (t) { return ({
                    todoist_id: t.id,
                    content: t.content,
                    parent_id: t.parent_id,
                }); });
                // Subsume sub tasks under main tasks
                for (_i = 0, withoutPrefixArr_1 = withoutPrefixArr; _i < withoutPrefixArr_1.length; _i++) {
                    m = withoutPrefixArr_1[_i];
                    for (_a = 0, subTasks_1 = subTasks; _a < subTasks_1.length; _a++) {
                        s = subTasks_1[_a];
                        if (s.parent_id == m.todoist_id) {
                            m.children.push({ content: "TODO " + s.content });
                        }
                        continue;
                    }
                }
                tasksIdWithoutPrefixArr = response.data.map(function (i) { return i.id; });
                return [2 /*return*/, {
                        withoutPrefixArr: withoutPrefixArr,
                        tasksIdWithoutPrefixArr: tasksIdWithoutPrefixArr,
                    }];
            case 3:
                e_1 = _b.sent();
                logseq.App.showMsg('There could be a typo in your Project ID or the Todoist API is down. Please check and try again.');
                return [2 /*return*/];
            case 4: return [3 /*break*/, 6];
            case 5: return [2 /*return*/, { withoutPrefixArr: [], tasksIdWithoutPrefixArr: [] }];
            case 6: return [2 /*return*/];
        }
    });
}); };
var handleTasksWithPrefix = function () { return __awaiter(void 0, void 0, void 0, function () {
    var response2, withPrefixArr, subTasks, _i, withPrefixArr_1, m, _a, subTasks_2, s, tasksIdWithPrefixArr, e_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!endpoints_config_1.default.projectIdWithPrefix) return [3 /*break*/, 5];
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, axios_1.default.get('https://api.todoist.com/rest/v1/tasks', {
                        params: { project_id: endpoints_config_1.default.projectIdWithPrefix },
                        headers: {
                            Authorization: "Bearer " + endpoints_config_1.default.apiToken,
                        },
                    })];
            case 2:
                response2 = _b.sent();
                withPrefixArr = response2.data
                    .filter(function (t) {
                    return !t.parent_id;
                })
                    .map(function (t) { return ({
                    todoist_id: t.id,
                    content: "" + t.content,
                    children: [],
                }); });
                subTasks = response2.data
                    .filter(function (t) {
                    return t.parent_id;
                })
                    .map(function (t) { return ({
                    todoist_id: t.id,
                    content: t.content,
                    parent_id: t.parent_id,
                }); });
                // Subsume sub tasks under main tasks
                for (_i = 0, withPrefixArr_1 = withPrefixArr; _i < withPrefixArr_1.length; _i++) {
                    m = withPrefixArr_1[_i];
                    for (_a = 0, subTasks_2 = subTasks; _a < subTasks_2.length; _a++) {
                        s = subTasks_2[_a];
                        if (s.parent_id == m.todoist_id) {
                            m.children.push({ content: "" + s.content });
                        }
                        continue;
                    }
                }
                tasksIdWithPrefixArr = response2.data.map(function (i) { return i.id; });
                return [2 /*return*/, {
                        withPrefixArr: withPrefixArr,
                        tasksIdWithPrefixArr: tasksIdWithPrefixArr,
                    }];
            case 3:
                e_2 = _b.sent();
                logseq.App.showMsg('There could be a typo in your Project ID or the Todoist API is down. Please check and try again.');
                return [2 /*return*/];
            case 4: return [3 /*break*/, 6];
            case 5: return [2 /*return*/, {
                    withPrefixArr: [],
                    tasksIdWithPrefixArr: [],
                }];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.default = { handleTasksWithPrefix: handleTasksWithPrefix, handleTasksWithoutPrefix: handleTasksWithoutPrefix };
