import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: '*',
        methods: 'GET,POST,PUT,DELETE',
        credentials: true,
    });

    const port = process.env.PORT || 3000;

    await app.listen(port);


}

bootstrap().catch(err => {
    console.error('Error al iniciar la aplicación:', err);
    process.exit(1);
});