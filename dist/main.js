"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const corsOrigin = process.env.CORS_ORIGIN || '*';
    app.enableCors({ origin: corsOrigin });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Backend NestJS Cirta démarré sur le port ${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map