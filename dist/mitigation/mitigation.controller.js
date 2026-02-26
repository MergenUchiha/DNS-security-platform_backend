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
exports.MitigationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const mitigation_service_1 = require("./mitigation.service");
const upsert_policy_dto_1 = require("./dto/upsert-policy.dto");
let MitigationController = class MitigationController {
    mitigation;
    constructor(mitigation) {
        this.mitigation = mitigation;
    }
    list(sessionId) {
        return this.mitigation.list(sessionId);
    }
    upsert(sessionId, dto) {
        return this.mitigation.upsert(sessionId, dto);
    }
};
exports.MitigationController = MitigationController;
__decorate([
    (0, common_1.Get)(':sessionId/policies'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MitigationController.prototype, "list", null);
__decorate([
    (0, common_1.Put)(':sessionId/policies'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, upsert_policy_dto_1.UpsertPolicyDto]),
    __metadata("design:returntype", void 0)
], MitigationController.prototype, "upsert", null);
exports.MitigationController = MitigationController = __decorate([
    (0, swagger_1.ApiTags)('mitigation'),
    (0, common_1.Controller)('mitigation'),
    __metadata("design:paramtypes", [mitigation_service_1.MitigationService])
], MitigationController);
//# sourceMappingURL=mitigation.controller.js.map