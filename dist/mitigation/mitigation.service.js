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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MitigationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const events_service_1 = require("../events/events.service");
let MitigationService = class MitigationService {
    prisma;
    events;
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    async list(sessionId) {
        return this.prisma.mitigationPolicy.findMany({
            where: { sessionId },
            orderBy: { domain: 'asc' },
        });
    }
    async upsert(sessionId, dto) {
        const existing = await this.prisma.mitigationPolicy.findFirst({
            where: { sessionId, domain: dto.domain },
        });
        const policy = existing
            ? await this.prisma.mitigationPolicy.update({
                where: { id: existing.id },
                data: { action: dto.action, allowedIps: dto.allowedIps },
            })
            : await this.prisma.mitigationPolicy.create({
                data: {
                    sessionId,
                    domain: dto.domain,
                    action: dto.action,
                    allowedIps: dto.allowedIps,
                },
            });
        await this.events.log(sessionId, 'MITIGATION_POLICY_UPSERTED', 'INFO', {
            domain: dto.domain,
            action: dto.action,
            allowedIps: dto.allowedIps,
        });
        return policy;
    }
    async getPolicy(sessionId, domain) {
        return this.prisma.mitigationPolicy.findFirst({
            where: { sessionId, domain },
        });
    }
};
exports.MitigationService = MitigationService;
exports.MitigationService = MitigationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService])
], MitigationService);
//# sourceMappingURL=mitigation.service.js.map