import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { useConversation } from '@elevenlabs/react-native';
import { maryPrompt } from '../constants/theme';
import { useLocation } from '../hooks/useLocation';
import { useAuth } from './AuthContext';
import { api, type UserContext } from '../lib/api';

const AGENT_ID = process.env.EXPO_PUBLIC_ELEVENLABS_AGENT_ID;
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface TripContext {
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  objectives?: string;
  participants?: string[];
}

export interface ResultItem {
  id: string;
  title: string;
  subtitle?: string;
  detail?: string;
  price?: string;
  meta?: string;
  imageUrl?: string;
}

export interface ToolEvent {
  id: string;
  name: string;
  label: string;
  icon: string;
  status: 'loading' | 'done' | 'error';
  results?: ResultItem[];
  message?: string;
}

const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
  create_trip: { label: 'Creando viaje', icon: 'airplane' },
  get_my_trips: { label: 'Consultando viajes', icon: 'list' },
  search_flights: { label: 'Buscando vuelos', icon: 'airplane-outline' },
  search_hotels: { label: 'Buscando hoteles', icon: 'bed-outline' },
  search_places: { label: 'Buscando en TripAdvisor', icon: 'compass-outline' },
  search_web: { label: 'Buscando en internet', icon: 'globe-outline' },
  add_transportation: { label: 'Transporte guardado', icon: 'train-outline' },
  add_accommodation: { label: 'Alojamiento guardado', icon: 'home-outline' },
  add_itinerary_item: { label: 'Agregado al itinerario', icon: 'calendar-outline' },
  save_memory: { label: 'Guardando preferencia', icon: 'bookmark-outline' },
  recall_memory: { label: 'Recordando', icon: 'search-outline' },
};

const TRIP_MODIFYING_TOOLS = new Set([
  'create_trip',
  'add_transportation',
  'add_accommodation',
  'add_itinerary_item',
]);

interface MaryAgentContextValue {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected';
  isSpeaking: boolean;
  isMuted: boolean;
  toolEvents: ToolEvent[];
  lastTripUpdate: number;
  location: ReturnType<typeof useLocation>;
  startConversation: () => Promise<void>;
  endConversation: () => Promise<void>;
  toggleMute: () => void;
  sendSelection: (text: string) => void;
  setActiveTrip: (trip: TripContext | null) => void;
  clearToolEvents: () => void;
}

const MaryAgentContext = createContext<MaryAgentContextValue | null>(null);

export function MaryAgentProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { token, user } = useAuth();
  const [activeTrip, setActiveTrip] = useState<TripContext | null>(null);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [toolEvents, setToolEvents] = useState<ToolEvent[]>([]);
  const [lastTripUpdate, setLastTripUpdate] = useState(0);
  const eventCounter = useRef(0);
  const tokenRef = useRef(token);
  const userRef = useRef(user);
  tokenRef.current = token;
  userRef.current = user;

  // ─── Client tool helpers ──────────────────────────────────────────────────

  const startTool = useCallback((name: string): string => {
    const meta = TOOL_LABELS[name] ?? { label: name, icon: 'construct-outline' };
    const id = `evt_${++eventCounter.current}`;
    console.log(`[Mary] Tool start: ${name}`);
    setToolEvents((prev) => [
      ...prev,
      { id, name, label: meta.label, icon: meta.icon, status: 'loading' },
    ]);
    return id;
  }, []);

  const finishTool = useCallback((
    id: string,
    name: string,
    results?: ResultItem[],
    message?: string,
  ) => {
    console.log(`[Mary] Tool done: ${name}`, results?.length ?? 0, 'items');
    setToolEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: 'done', results, message };
      return updated;
    });
    if (TRIP_MODIFYING_TOOLS.has(name)) {
      setLastTripUpdate(Date.now());
    }
  }, []);

  const callBackend = useCallback(async (
    path: string,
    params: Record<string, unknown>,
  ): Promise<any> => {
    const res = await fetch(`${API_URL}/agent-tools/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenRef.current ?? ''}`,
      },
      body: JSON.stringify({ ...params, user_id: userRef.current?.id ?? '' }),
    });
    return res.json();
  }, []);

  const parseItems = useCallback((raw: any): ResultItem[] | undefined => {
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const result = obj?.result ?? obj;
      const parsed = typeof result === 'string' ? JSON.parse(result) : result;
      if (parsed?.items && Array.isArray(parsed.items)) return parsed.items;
    } catch { /* not structured */ }
    return undefined;
  }, []);

  // ─── Client tools definition ─────────────────────────────────────────────
  // useMemo with stable deps so the object reference never changes between renders.
  // The ElevenLabs SDK watches clientTools for reference changes and will restart
  // the session if a new object is passed, causing immediate disconnections.

  const clientTools = useMemo(() => ({
    create_trip: async (params: any) => {
      const id = startTool('create_trip');
      const res = await callBackend('create_trip', params);
      finishTool(id, 'create_trip', undefined, res.result);
      return res.result;
    },

    get_my_trips: async (_params: any) => {
      const id = startTool('get_my_trips');
      const res = await callBackend('get_my_trips', {});
      finishTool(id, 'get_my_trips');
      return JSON.stringify(res.result ?? res);
    },

    search_flights: async (params: any) => {
      const id = startTool('search_flights');
      const res = await callBackend('search_flights', params);
      const items = parseItems(res);
      finishTool(id, 'search_flights', items);
      const obj = typeof res.result === 'string' ? JSON.parse(res.result).summary : res.result;
      return typeof obj === 'string' ? obj : (res.result ?? 'Búsqueda completada');
    },

    search_hotels: async (params: any) => {
      const id = startTool('search_hotels');
      const res = await callBackend('search_hotels', params);
      const items = parseItems(res);
      finishTool(id, 'search_hotels', items);
      try { return JSON.parse(res.result).summary; } catch { return res.result ?? 'Búsqueda completada'; }
    },

    search_places: async (params: any) => {
      const id = startTool('search_places');
      const res = await callBackend('search_places', params);
      const items = parseItems(res);
      finishTool(id, 'search_places', items);
      try { return JSON.parse(res.result).summary; } catch { return res.result ?? 'Búsqueda completada'; }
    },

    search_web: async (params: any) => {
      const id = startTool('search_web');
      const res = await callBackend('search_web', params);
      const items = parseItems(res);
      finishTool(id, 'search_web', items);
      try { return JSON.parse(res.result).summary; } catch { return res.result ?? 'Búsqueda completada'; }
    },

    add_transportation: async (params: any) => {
      const id = startTool('add_transportation');
      const res = await callBackend('add_transportation', params);
      finishTool(id, 'add_transportation', undefined, res.result);
      return res.result;
    },

    add_accommodation: async (params: any) => {
      const id = startTool('add_accommodation');
      const res = await callBackend('add_accommodation', params);
      finishTool(id, 'add_accommodation', undefined, res.result);
      return res.result;
    },

    add_itinerary_item: async (params: any) => {
      const id = startTool('add_itinerary_item');
      const res = await callBackend('add_itinerary_item', params);
      finishTool(id, 'add_itinerary_item', undefined, res.result);
      return res.result;
    },

    save_memory: async (params: any) => {
      const id = startTool('save_memory');
      const res = await callBackend('save_memory', params);
      finishTool(id, 'save_memory', undefined, res.result);
      return res.result;
    },

    recall_memory: async (params: any) => {
      const id = startTool('recall_memory');
      const res = await callBackend('recall_memory', params);
      const memories = res.result?.memories;
      finishTool(id, 'recall_memory', undefined);
      return memories
        ? memories.map((m: any) => `[${m.category}] ${m.content}`).join('\n')
        : (typeof res.result === 'string' ? res.result : 'Sin resultados en memoria.');
    },
  }), [startTool, finishTool, callBackend, parseItems]);

  // ─── Conversation ─────────────────────────────────────────────────────────

  const conversation = useConversation({
    clientTools,
    onConnect: () => {
      setStatus('connected');
      console.log('[Mary] Connected');
    },
    onDisconnect: () => {
      setStatus('idle');
      setIsSpeaking(false);
      setIsMuted(false);
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

  // ─── First message ────────────────────────────────────────────────────────

  const buildFirstMessage = useCallback((ctx: UserContext | null): string => {
    const noMemories = !ctx || ctx.memories.length === 0;
    const noTrips = !ctx || ctx.trips.length === 0;

    if (noMemories && noTrips) {
      return '¡Hola! Soy Mary, tu guía turística personal. ¿Cómo te llamo?';
    }

    const nameFact = ctx?.memories.find(
      (m) => m.category === 'FACT' && m.content.toLowerCase().includes('se llama'),
    );
    const name = nameFact
      ? nameFact.content.replace(/.*se llama\s+/i, '').trim().split(/\s+/)[0]
      : null;

    const hasOriginCity = ctx?.memories.some(
      (m) => m.category === 'FACT' && m.content.toLowerCase().includes('ciudad de origen'),
    );
    const hasPreferences = ctx?.memories.some((m) => m.category === 'PREFERENCE');
    const hasTrips = (ctx?.trips.length ?? 0) > 0;

    const greeting = name ? `¡Hola, ${name}!` : '¡Hola de nuevo!';

    if (name && !hasOriginCity && noTrips) {
      return `${greeting} ¿A dónde quieres viajar? Y dime, ¿desde qué ciudad sales normalmente?`;
    }
    if (hasTrips) {
      const lastTrip = ctx!.trips[0];
      return hasPreferences
        ? `${greeting} Tienes un viaje a ${lastTrip.destination} en proceso. ¿Seguimos planificándolo?`
        : `${greeting} Tienes un viaje a ${lastTrip.destination} guardado. ¿En qué te puedo ayudar?`;
    }
    if (hasPreferences) {
      return `${greeting} Recuerdo tus preferencias. ¿A dónde quieres viajar esta vez?`;
    }
    if (name) {
      return `${greeting} ¿A dónde quieres viajar?`;
    }
    return '¡Hola de nuevo! ¿Cómo te llamo? Y cuéntame, ¿en qué puedo ayudarte hoy?';
  }, []);

  // ─── Prompt builder ───────────────────────────────────────────────────────

  const buildPrompt = useCallback(
    (ctx?: UserContext | null) => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('es', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      const isoDate = now.toISOString().split('T')[0];

      const dateContext = `\n## Fecha y hora actual\n- Hoy es ${dateStr} (${isoDate}), son las ${timeStr}\n- Usa esta fecha como referencia para todas las búsquedas.`;
      const locationContext = `\n## Ubicación actual\n${location.contextString}`;

      let userDataContext = '';
      if (ctx) {
        if (ctx.memories.length > 0) {
          const facts = ctx.memories.filter((m) => m.category === 'FACT');
          const prefs = ctx.memories.filter((m) => m.category === 'PREFERENCE');
          const notes = ctx.memories.filter((m) => m.category === 'NOTE');

          let memSection = '\n## Lo que sé del usuario (memoria persistente)\n';
          memSection += 'Usa esta información para personalizar TODAS tus respuestas sin pedirla de nuevo.\n';
          if (facts.length > 0) {
            memSection += '\n**Datos personales:**\n' + facts.map((m) => `  - ${m.content}`).join('\n');
          }
          if (prefs.length > 0) {
            memSection += '\n**Preferencias:**\n' + prefs.map((m) => `  - ${m.content}`).join('\n');
          }
          if (notes.length > 0) {
            memSection += '\n**Notas:**\n' + notes.map((m) => `  - ${m.content}`).join('\n');
          }
          userDataContext += memSection;
        } else {
          userDataContext += '\n## Memoria del usuario\nNo hay datos guardados todavía. Guarda información relevante durante la conversación.';
        }

        if (ctx.trips.length > 0) {
          const tripsStr = ctx.trips.map(
            (t) => `  - "${t.title}" → ${t.destination} (${t.status}) [${t.startDate}${t.endDate ? ` a ${t.endDate}` : ''}]`,
          ).join('\n');
          userDataContext += `\n## Viajes del usuario\n${tripsStr}`;
        }
      }

      let tripContext = '';
      if (activeTrip) {
        tripContext = `\n## Viaje activo en la app\n- Destino: ${activeTrip.destination}\n- Título: ${activeTrip.title}\n- Fechas: ${activeTrip.startDate} a ${activeTrip.endDate ?? 'sin definir'}`;
      }

      return maryPrompt + dateContext + locationContext + userDataContext + tripContext;
    },
    [location.contextString, activeTrip],
  );

  // ─── Session control ──────────────────────────────────────────────────────

  const startConversation = useCallback(async () => {
    if (!AGENT_ID) {
      console.error('[Mary] No agent ID configured.');
      return;
    }

    setStatus('connecting');
    setToolEvents([]);
    eventCounter.current = 0;

    let ctx: UserContext | null = null;
    if (token) {
      try {
        ctx = await api.getUserContext(token);
        console.log(`[Mary] Context loaded: ${ctx.trips.length} trips, ${ctx.memories.length} memories`);
      } catch (e) {
        console.warn('[Mary] Failed to load context:', e);
      }
    }

    const prompt = buildPrompt(ctx);
    const firstMessage = buildFirstMessage(ctx);

    await conversation.startSession({
      agentId: AGENT_ID,
      overrides: {
        agent: { prompt: { prompt }, firstMessage, language: 'es' },
      },
      dynamicVariables: {
        user_token: token ?? '',
        user_id: user?.id ?? '',
      },
    });
  }, [conversation, buildPrompt, buildFirstMessage, token, user]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    conversation.setMicMuted(next);
    setIsMuted(next);
    console.log(`[Mary] Mic ${next ? 'muted' : 'unmuted'}`);
  }, [conversation, isMuted]);

  const sendSelection = useCallback((text: string) => {
    conversation.sendUserMessage(text);
    console.log(`[Mary] User selection sent: ${text}`);
  }, [conversation]);

  return (
    <MaryAgentContext.Provider
      value={{
        status,
        isSpeaking,
        isMuted,
        toolEvents,
        lastTripUpdate,
        location,
        startConversation,
        endConversation,
        toggleMute,
        sendSelection,
        setActiveTrip,
        clearToolEvents: () => setToolEvents([]),
      }}
    >
      {children}
    </MaryAgentContext.Provider>
  );
}

export function useMaryAgent(): MaryAgentContextValue {
  const ctx = useContext(MaryAgentContext);
  if (!ctx) throw new Error('useMaryAgent must be used within MaryAgentProvider');
  return ctx;
}
