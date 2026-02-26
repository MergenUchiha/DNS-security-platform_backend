"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DnsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dns_service_1 = require("./dns.service");
const resolve_dto_1 = require("./dto/resolve.dto");
let DnsController = class DnsController {
    dns;
    constructor(dns) {
        this.dns = dns;
    }
    resolve(q) {
        return this.dns.resolve(q.sessionId, q.name, q.type);
    }
    targetUrl(q) {
        return this.dns.resolveTargetUrl(q.sessionId, q.name, q.type);
    }
};
exports.DnsController = DnsController;
__decorate([
    (0, common_1.Get)('resolve'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resolve_dto_1.ResolveQueryDto]),
    __metadata("design:returntype", void 0)
], DnsController.prototype, "resolve", null);
__decorate([
    (0, common_1.Get)('target-url'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resolve_dto_1.ResolveQueryDto]),
    __metadata("design:returntype", void 0)
], DnsController.prototype, "targetUrl", null);
exports.DnsController = DnsController = __decorate([
    (0, swagger_1.ApiTags)('dns'),
    (0, common_1.Controller)('dns'),
    __metadata("design:paramtypes", [dns_service_1.DnsService])
], DnsController);
//# sourceMappingURL=dns.controller.js.map