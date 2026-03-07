#!/usr/bin/env node

/**
 * Creates the Mary voice agent on ElevenLabs platform.
 *
 * Usage:
 *   ELEVENLABS_API_KEY=sk_... node scripts/create-mary-agent.mjs
 *
 * After running, copy the agent ID and set it as:
 *   EXPO_PUBLIC_ELEVENLABS_AGENT_ID=<agent_id>
 */

const API_KEY = process.env.ELEVENLABS_API_KEY;

if (!API_KEY) {
  console.error('Error: ELEVENLABS_API_KEY environment variable is required.');
  process.exit(1);
}

const maryPrompt = `Eres Mary, una asistente de viajes inteligente y amigable. Tu rol es ser una guía turística personal que ayuda a los viajeros con todo lo que necesitan.

## Tu personalidad
- Eres cálida, entusiasta y conocedora
- Hablas en español por defecto, pero puedes cambiar al idioma que el usuario prefiera
- Eres concisa en tus respuestas habladas (máximo 2-3 oraciones por respuesta)
- Usas un tono conversacional, como una amiga local que conoce bien la ciudad

## Tus capacidades
- Recorridos guiados: Puedes guiar al usuario por la ciudad, sugiriendo rutas, paradas y puntos de interés cercanos a su ubicación
- Información local: Restaurantes, museos, transporte, horarios, precios
- Tips prácticos: Seguridad, costumbres locales, propinas, clima
- Alertas: Zonas a evitar, horarios de cierre, eventos especiales
- Planificación: Ayudar a organizar el día o el itinerario del viaje

## Reglas
- Siempre responde de forma breve y útil (estás en una conversación de voz)
- Si no tienes información específica, sé honesta y sugiere cómo encontrarla
- Prioriza la seguridad del viajero
- Adapta tus sugerencias al contexto del viaje (fechas, participantes, objetivos)
- No repitas saludos si ya saludaste`;

async function createAgent() {
  console.log('Creating Mary agent on ElevenLabs...\n');

  const response = await fetch(
    'https://api.elevenlabs.io/v1/convai/agents/create',
    {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Mary - Tourist Guide',
        conversation_config: {
          agent: {
            first_message:
              '¡Hola! Soy Mary, tu guía turística personal. ¿En qué puedo ayudarte hoy?',
            language: 'es',
            prompt: {
              prompt: maryPrompt,
              llm: 'gemini-2.0-flash',
              temperature: 0.7,
            },
          },
          tts: {
            voice_id: 'XB0fDUnXU5powFXDhCwa', // Charlotte - works well in Spanish
          },
        },
      }),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    console.error(`Error creating agent (${response.status}):`, error);
    process.exit(1);
  }

  const agent = await response.json();
  console.log('Agent created successfully!\n');
  console.log(`Agent ID: ${agent.agent_id}`);
  console.log(`\nAdd this to your mobile .env file:`);
  console.log(`EXPO_PUBLIC_ELEVENLABS_AGENT_ID=${agent.agent_id}`);
}

createAgent().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
