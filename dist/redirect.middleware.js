"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedirectMiddleware = void 0;
const common_1 = require("@nestjs/common");
let RedirectMiddleware = class RedirectMiddleware {
    use(req, res, next) {
        if (req.path === '/') {
            const redirectUrl = `${req.protocol}://${req.get('host')}/api/v1`;
            return res.redirect(redirectUrl);
        }
        next();
    }
};
exports.RedirectMiddleware = RedirectMiddleware;
exports.RedirectMiddleware = RedirectMiddleware = __decorate([
    (0, common_1.Injectable)()
], RedirectMiddleware);
//# sourceMappingURL=redirect.middleware.js.map