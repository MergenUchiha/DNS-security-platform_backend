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
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const events_service_1 = require("../events/events.service");
const config_1 = require("@nestjs/config");
let SessionsService = class SessionsService {
    prisma;
    events;
    config;
    constructor(prisma, events, config) {
        this.prisma = prisma;
        this.events = events;
        this.config = config;
    }
    async create(dto) {
        const active = await this.prisma.labSession.findFirst({
            where: { endedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (active) {
            await this.end(active.id);
        }
        const session = await this.prisma.labSession.create({
            data: { mode: client_1.LabMode.SAFE },
        });
        await this.events.log(session.id, 'SESSION_STARTED', 'INFO', {
            note: dto.note ?? null,
        });
        const defaultDomain = this.config.get('DEFAULT_POLICY_DOMAIN', 'bank.lab');
        const defaultAction = this.config.get('DEFAULT_POLICY_ACTION', 'FORCE_SAFE_IP');
        const legitIp = this.config.get('LEGIT_IP', '172.20.0.11');
        await this.prisma.mitigationPolicy.create({
            data: {
                sessionId: session.id,
                domain: defaultDomain,
                action: defaultAction,
                allowedIps: [legitIp],
            },
        });
        await this.events.log(session.id, 'MITIGATION_POLICY_UPSERTED', 'INFO', {
            domain: defaultDomain,
            action: defaultAction,
            allowedIps: [legitIp],
            auto: true,
        });
        return session;
    }
    async current() {
        const session = await this.prisma.labSession.findFirst({
            where: { endedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (!session)
            throw new common_1.NotFoundException('No active session');
        return session;
    }
    async byId(sessionId) {
        const s = await this.prisma.labSession.findUnique({
            where: { id: sessionId },
        });
        if (!s)
            throw new common_1.NotFoundException('Session not found');
        return s;
    }
    async end(sessionId) {
        const s = await this.byId(sessionId);
        if (s.endedAt)
            return s;
        const ended = await this.prisma.labSession.update({
            where: { id: sessionId },
            data: { endedAt: new Date() },
        });
        await this.events.log(sessionId, 'SESSION_ENDED', 'INFO');
        return ended;
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_service_1.EventsService,
        config_1.ConfigService])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map