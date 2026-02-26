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
exports.LabController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const lab_service_1 = require("./lab.service");
const set_mode_dto_1 = require("./dto/set-mode.dto");
let LabController = class LabController {
    lab;
    constructor(lab) {
        this.lab = lab;
    }
    setMode(sessionId, dto) {
        return this.lab.setMode(sessionId, dto.mode);
    }
    reset(sessionId) {
        return this.lab.reset(sessionId);
    }
    status(sessionId, domain, eventsTake) {
        const take = Math.min(Math.max(Number(eventsTake ?? 30), 1), 200);
        return this.lab.status(sessionId, domain, take);
    }
    bootstrap(sessionId, body) {
        return this.lab.bootstrap(sessionId, body?.domain);
    }
    quickDemo(sessionId, body) {
        return this.lab.quickDemo(sessionId, body?.domain, body?.type);
    }
};
exports.LabController = LabController;
__decorate([
    (0, common_1.Post)(':sessionId/mode'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_mode_dto_1.SetModeDto]),
    __metadata("design:returntype", void 0)
], LabController.prototype, "setMode", null);
__decorate([
    (0, common_1.Post)(':sessionId/reset'),
    __param(0, (0, common_1.Param)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LabController.prototype, "reset", null);
__decorate([
    (0, common_1.Get)(':sessionId/status'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Query)('domain')),
    __param(2, (0, common_1.Query)('eventsTake')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], LabController.prototype, "status", null);
__decorate([
    (0, common_1.Post)(':sessionId/bootstrap'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LabController.prototype, "bootstrap", null);
__decorate([
    (0, common_1.Post)(':sessionId/quick-demo'),
    __param(0, (0, common_1.Param)('sessionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], LabController.prototype, "quickDemo", null);
exports.LabController = LabController = __decorate([
    (0, swagger_1.ApiTags)('lab'),
    (0, common_1.Controller)('lab'),
    __metadata("design:paramtypes", [lab_service_1.LabService])
], LabController);
//# sourceMappingURL=lab.controller.js.map