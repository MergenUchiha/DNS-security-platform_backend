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
exports.ReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReportService = class ReportService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async build(sessionId) {
        const session = await this.prisma.labSession.findUnique({
            where: { id: sessionId },
        });
        const queries = await this.prisma.dnsQuery.findMany({
            where: { sessionId },
            orderBy: { ts: 'asc' },
        });
        const events = await this.prisma.event.findMany({
            where: { sessionId },
            orderBy: { ts: 'asc' },
        });
        const byDomain = {};
        for (const q of queries) {
            if (!byDomain[q.name])
                byDomain[q.name] = { name: q.name, samples: [] };
            byDomain[q.name].samples.push({
                ts: q.ts,
                qtype: q.qtype,
                resolver: q.resolver,
                answer: q.answer,
                finalAction: q.finalAction,
                finalAnswer: q.finalAnswer,
            });
        }
        const spoofDetected = events.filter((e) => e.type === 'SPOOF_DETECTED').length;
        const spoofBlocked = events.filter((e) => e.type === 'SPOOF_BLOCKED').length;
        const forced = events.filter((e) => e.type === 'SAFE_RESOLUTION_FORCED').length;
        return {
            session,
            summary: {
                totalQueries: queries.length,
                spoofDetected,
                spoofBlocked,
                safeResolutionForced: forced,
            },
            domains: Object.values(byDomain),
            events,
        };
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportService);
//# sourceMappingURL=report.service.js.map