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
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const conversation = useConversation({
    onConnect: () => {
      setStatus('connected');
      console.log('[Mary] Connected');
    },
    onDisconnect: () => {
      setStatus('idle');
      setIsSpeaking(false);
      console.log('[Mary] Disconnected');
    },
    onModeChange: ({ mode }) => {
      setIsSpeaking(mode === 'speaking');
    },
    onError: (message) => {
      setStatus('idle');
      setIsSpeaking(false);
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

    setStatus('connecting');
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
    status,
    isSpeaking,
    startConversation,
    endConversation,
    setActiveTrip,
    location,
  };
}
