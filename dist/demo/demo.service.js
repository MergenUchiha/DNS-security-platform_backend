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
exports.DemoService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const sessions_service_1 = require("../sessions/sessions.service");
const lab_service_1 = require("../lab/lab.service");
const dns_service_1 = require("../dns/dns.service");
const events_service_1 = require("../events/events.service");
let DemoService = class DemoService {
    sessions;
    lab;
    dns;
    events;
    config;
    constructor(sessions, lab, dns, events, config) {
        this.sessions = sessions;
        this.lab = lab;
        this.dns = dns;
        this.events = events;
        this.config = config;
    }
    async run(domain, type = 'A') {
        const demoDomain = domain ?? this.config.get('DEFAULT_POLICY_DOMAIN', 'bank.lab');
        const session = await this.sessions.create({ note: 'auto demo run' });
        const sessionId = session.id;
        await this.lab.setMode(sessionId, client_1.LabMode.SAFE);
        const safe = await this.dns.resolve(sessionId, demoDomain, type);
        await this.lab.setMode(sessionId, client_1.LabMode.ATTACK);
        const attack = await this.dns.resolve(sessionId, demoDomain, type);
        await this.lab.setMode(sessionId, client_1.LabMode.MITIGATED);
        const mitigated = await this.dns.resolve(sessionId, demoDomain, type);
        await this.events.log(sessionId, 'MODE_CHANGED', 'INFO', {
            finishedDemo: true,
        });
        return {
            sessionId,
            domain: demoDomain,
            steps: { safe, attack, mitigated },
            hint: {
                legitSite: 'http://localhost:8081',
                fakeSite: 'http://localhost:8082',
                docs: 'http://localhost:3000/docs',
            },
        };
    }
};
exports.DemoService = DemoService;
exports.DemoService = DemoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sessions_service_1.SessionsService,
        lab_service_1.LabService,
        dns_service_1.DnsService,
        events_service_1.EventsService,
        config_1.ConfigService])
], DemoService);
//# sourceMappingURL=demo.service.js.map