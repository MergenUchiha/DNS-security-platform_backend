"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const events_module_1 = require("./events/events.module");
const sessions_module_1 = require("./sessions/sessions.module");
const lab_module_1 = require("./lab/lab.module");
const mitigation_module_1 = require("./mitigation/mitigation.module");
const dns_module_1 = require("./dns/dns.module");
const report_module_1 = require("./report/report.module");
const health_module_1 = require("./health/health.module");
const demo_module_1 = require("./demo/demo.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, events_module_1.EventsModule, sessions_module_1.SessionsModule, lab_module_1.LabModule, mitigation_module_1.MitigationModule, dns_module_1.DnsModule, report_module_1.ReportModule, health_module_1.HealthModule, demo_module_1.DemoModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map