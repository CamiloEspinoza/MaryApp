import { useConversation } from '@elevenlabs/react-native';
import { useCallback, useState } from 'react';
import { maryPrompt, maryFirstMessage } from '../constants/theme';
import { useLocation } from './useLocation';

const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;

interface TripContext {
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  objectives?: string;
  participants?: string[];
}

export function useMaryAgent() {
  const location = useLocation();
  const [activeTrip, setActiveTrip] = useState<TripContext | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('[Mary] Connected');
    },
    onDisconnect: () => {
      console.log('[Mary] Disconnected');
    },
    onError: (message) => {
      console.error('[Mary] Error:', message);
    },
    onMessage: (message) => {
      console.log('[Mary] Message:', message);
    },
  });

  const buildPrompt = useCallback(() => {
    let locationContext = `\n## Ubicación actual\n${location.contextString}`;

    let tripContext = '';
    if (activeTrip) {
      tripContext = `\n## Viaje activo
- Destino: ${activeTrip.destination}
- Título: ${activeTrip.title}
- Fechas: ${activeTrip.startDate} a ${activeTrip.endDate ?? 'sin definir'}
- Objetivos: ${activeTrip.objectives ?? 'No especificados'}
- Participantes: ${activeTrip.participants?.join(', ') ?? 'No especificados'}`;
    }

    return maryPrompt + locationContext + tripContext;
  }, [location.contextString, activeTrip]);

  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      console.error('[Mary] No agent ID configured. Set EXPO_PUBLIC_ELEVENLABS_AGENT_ID.');
      return;
    }

    const prompt = buildPrompt();

    await conversation.startSession({
      agentId: AGENT_ID,
      overrides: {
        agent: {
          prompt: {
            prompt,
          },
          firstMessage: maryFirstMessage,
          language: 'es',
        },
      },
    });
  }, [conversation, buildPrompt]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return {
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    startConversation,
    endConversation,
    setActiveTrip,
    location,
  };
}
