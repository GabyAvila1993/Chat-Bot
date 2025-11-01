import { Module } from '@nestjs/common';
import { ChatbotController } from './controllers/chatbot.controller';
import { GeminiService } from './services/gemini.service';

@Module({
  imports: [],
  controllers: [ChatbotController],
  providers: [GeminiService],
})
export class AppModule {}