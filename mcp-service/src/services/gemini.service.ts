import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { saludMapContext, medicalContexts } from '../config/mcp-context';
import { MCPMedicalContext } from '../interfaces/mcp-medical-context.interface';

@Injectable()
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('API key de Gemini no configurada. Verifica tu archivo .env');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  
  private findRelevantMedicalContexts(message: string): MCPMedicalContext[] {
    const words = message.toLowerCase().split(/\s+/);
    return medicalContexts.filter(context => 
      context.keywords.some(keyword => 
        words.some(word => word.includes(keyword.toLowerCase()))
      )
    );
  }

  private getContextSpecificPrompt(relevantContexts: MCPMedicalContext[]): string {
    let contextInfo = '';
    
    if (relevantContexts.length > 0) {
      contextInfo = relevantContexts.map(ctx => `
=== INFORMACIÓN SOBRE ${ctx.name.toUpperCase()} ===
${ctx.content.description}

TEMAS PRINCIPALES:
${ctx.content.mainTopics?.map(topic => `- ${topic}`).join('\n') || ''}

SÍNTOMAS COMUNES:
${ctx.content.symptoms?.map(symptom => `- ${symptom}`).join('\n') || ''}

FACTORES DE RIESGO:
${ctx.content.riskFactors?.map(factor => `- ${factor}`).join('\n') || ''}

RECOMENDACIONES:
${ctx.content.recommendations?.map(rec => `- ${rec}`).join('\n') || ''}
`).join('\n');
    }

    return contextInfo;
  }

  private getSystemPrompt(message: string): string {
    const project = saludMapContext.projectInfo;
    const relevantContexts = this.findRelevantMedicalContexts(message);

    const projectInfo = `
Eres ${project.botName} (${project.descriptionBotName}), el asistente virtual de ${project.name}.

INFORMACIÓN DEL PROYECTO:
- Nombre: ${project.name}
- Asistente: ${project.botName} - ${project.descriptionBotName}
- Descripción: ${project.description}
- Misión: ${project.mission}
- Visión: ${project.vision}

FUNCIONALIDADES PRINCIPALES:
${saludMapContext.features.map(f => `- ${f.name}: ${f.description}`).join('\n')}
`;

    const contextInfo = this.getContextSpecificPrompt(relevantContexts);
    const hasRelevantContext = relevantContexts.length > 0;

    return `
${projectInfo}

${hasRelevantContext ? contextInfo : ''}

INSTRUCCIONES PARA EL ASISTENTE:
1. Responde siempre en español, con un tono empático y profesional.
2. ${hasRelevantContext ? 'He detectado términos relacionados con temas médicos específicos. Usa la información proporcionada arriba para dar una respuesta precisa.' : 'Si el usuario menciona términos médicos, pregunta por más detalles para identificar el contexto específico.'}
3. Si el usuario menciona síntomas o condiciones médicas, pregunta por más detalles y sugiere consultar a un profesional de la salud.
4. Enfócate en brindar información útil, breve y basada en evidencia.
5. Menciona las funcionalidades de SaludMap que podrían ser relevantes (por ejemplo, búsqueda de especialistas o reserva de turnos).
6. Si detectas palabras clave de múltiples condiciones médicas, pregunta al usuario sobre cuál quiere información específica.

¿En qué puedo ayudarte hoy?
`;
  }

  
  async generateResponse(userMessage: string): Promise<string> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: 'user',
          parts: [{ text: `${this.getSystemPrompt(userMessage)}\n\nUsuario: ${userMessage}` }]
        }]
      });

      return response.text;
    } catch (error: any) {
      console.error(' Error al generar respuesta:', error);
      throw new Error(`Error al conectar con Gemini: ${error.message || 'Desconocido'}`);
    }
  }

  async getFeatureInfo(featureId: string): Promise<string> {
    const feature = saludMapContext.features.find(f => f.id === featureId);

    if (!feature) {
      return 'No encontré información sobre esa funcionalidad.';
    }

    const prompt = `Explica en detalle la funcionalidad "${feature.name}" de SaludMap: ${feature.description}. Incluye casos de uso y beneficios para el usuario.`;

    return this.generateResponse(prompt);
  }

  
  async testConnection(): Promise<string> {
    try {
      const result = await this.generateResponse('Hola');
      return ` Conexión exitosa. Respuesta: ${result}`;
    } catch (error: any) {
      return ` Error al conectar con Gemini: ${error.message || 'Desconocido'}`;
    }
  }
}
