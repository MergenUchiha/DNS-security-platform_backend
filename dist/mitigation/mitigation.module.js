"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MitigationModule = void 0;
const common_1 = require("@nestjs/common");
const mitigation_controller_1 = require("./mitigation.controller");
const mitigation_service_1 = require("./mitigation.service");
const events_module_1 = require("../events/events.module");
let MitigationModule = class MitigationModule {
};
exports.MitigationModule = MitigationModule;
exports.MitigationModule = MitigationModule = __decorate([
    (0, common_1.Module)({
        imports: [events_module_1.EventsModule],
        controllers: [mitigation_controller_1.MitigationController],
        providers: [mitigation_service_1.MitigationService],
        exports: [mitigation_service_1.MitigationService],
    })
], MitigationModule);
//# sourceMappingURL=mitigation.module.js.map