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
exports.SessionsSummaryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
let SessionsSummaryController = class SessionsSummaryController {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async summary(id, eventsTake) {
        const take = Math.min(Math.max(Number(eventsTake ?? 50), 1), 200);
        const session = await this.prisma.labSession.findUnique({ where: { id } });
        if (!session)
            return { error: 'Session not found' };
        const [queriesCount, detected, blocked, forced, events] = await Promise.all([
            this.prisma.dnsQuery.count({ where: { sessionId: id } }),
            this.prisma.event.count({
                where: { sessionId: id, type: 'SPOOF_DETECTED' },
            }),
            this.prisma.event.count({
                where: { sessionId: id, type: 'SPOOF_BLOCKED' },
            }),
            this.prisma.event.count({
                where: { sessionId: id, type: 'SAFE_RESOLUTION_FORCED' },
            }),
            this.prisma.event.findMany({
                where: { sessionId: id },
                orderBy: { ts: 'desc' },
                take,
            }),
        ]);
        return {
            session,
            stats: {
                queriesCount,
                spoofDetected: detected,
                spoofBlocked: blocked,
                safeResolutionForced: forced,
            },
            events,
        };
    }
};
exports.SessionsSummaryController = SessionsSummaryController;
__decorate([
    (0, common_1.Get)(':id/summary'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('eventsTake')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SessionsSummaryController.prototype, "summary", null);
exports.SessionsSummaryController = SessionsSummaryController = __decorate([
    (0, swagger_1.ApiTags)('sessions'),
    (0, common_1.Controller)('sessions'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SessionsSummaryController);
//# sourceMappingURL=sessions.summary.controller.js.map