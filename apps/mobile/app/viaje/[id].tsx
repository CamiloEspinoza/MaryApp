import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../constants/theme';
import { api, type Trip } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useMaryAgent } from '../../hooks/useMaryAgent';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(iso: string): string {
  return iso.split('T')[0];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

function transportIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type.toUpperCase()) {
    case 'FLIGHT': return 'airplane';
    case 'TRAIN': return 'train';
    case 'BUS': return 'bus';
    case 'CAR': return 'car';
    default: return 'navigate';
  }
}

function itemTypeIcon(type: string): keyof typeof Ionicons.glyphMap {
  switch (type.toUpperCase()) {
    case 'MEAL': return 'restaurant';
    case 'VISIT': return 'camera';
    case 'TRANSPORT': return 'navigate';
    case 'ACTIVITY': return 'star';
    default: return 'ellipse';
  }
}

// ─── Build unified timeline ───────────────────────────────────────────────────

interface DayData {
  dateKey: string;
  dateLabel: string;
  city?: string;
  transportsOut: NonNullable<Trip['transportations']>;
  transportsIn: NonNullable<Trip['transportations']>;
  accomCheckins: NonNullable<Trip['accommodations']>;
  accomCheckouts: NonNullable<Trip['accommodations']>;
  itineraryItems: NonNullable<NonNullable<Trip['itineraryDays']>[number]['items']>;
}

function buildTimeline(trip: Trip): DayData[] {
  const map = new Map<string, DayData>();

  const ensure = (key: string, iso: string): DayData => {
    if (!map.has(key)) {
      map.set(key, {
        dateKey: key,
        dateLabel: formatDate(iso),
        transportsOut: [],
        transportsIn: [],
        accomCheckins: [],
        accomCheckouts: [],
        itineraryItems: [],
      });
    }
    return map.get(key)!;
  };

  for (const t of trip.transportations ?? []) {
    ensure(toDateKey(t.departureTime), t.departureTime).transportsOut.push(t);
    ensure(toDateKey(t.arrivalTime), t.arrivalTime).transportsIn.push(t);
  }

  for (const a of trip.accommodations ?? []) {
    ensure(toDateKey(a.checkIn), a.checkIn).accomCheckins.push(a);
    ensure(toDateKey(a.checkOut), a.checkOut).accomCheckouts.push(a);
  }

  for (const day of trip.itineraryDays ?? []) {
    const d = ensure(toDateKey(day.date), day.date);
    d.itineraryItems.push(...day.items);
  }

  // Sort days chronologically
  const sorted = Array.from(map.values()).sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  // Infer current city per day by tracking transport arrivals
  let currentCity: string | undefined = undefined;
  for (const day of sorted) {
    // Arrivals that day set the city
    if (day.transportsIn.length > 0) {
      currentCity = day.transportsIn[day.transportsIn.length - 1].destination;
    }
    // If no arrival and no prior city, use first departure origin
    if (!currentCity && day.transportsOut.length > 0) {
      currentCity = day.transportsOut[0].origin;
    }
    // Check-in hotel name as city hint if no transport info
    if (!currentCity && day.accomCheckins.length > 0) {
      currentCity = day.accomCheckins[0].name;
    }
    day.city = currentCity;
    // Departures change current city for next days
    if (day.transportsOut.length > 0) {
      currentCity = day.transportsOut[day.transportsOut.length - 1].destination;
    }
  }

  return sorted;
}

function buildRoute(trip: Trip): string[] {
  const transports = [...(trip.transportations ?? [])].sort(
    (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime(),
  );
  if (transports.length === 0) return [];

  const stops: string[] = [transports[0].origin];
  for (const t of transports) {
    if (stops[stops.length - 1] !== t.destination) {
      stops.push(t.destination);
    }
  }
  return stops;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TransportCard({ t }: { t: NonNullable<Trip['transportations']>[number] }) {
  return (
    <View
      style={{
        backgroundColor: colors.primary,
        borderRadius: 12,
        padding: 14,
        marginBottom: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Ionicons name={transportIcon(t.type)} size={18} color={colors.textLight} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textLight }}>
            {t.origin} → {t.destination}
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: 'rgba(225,221,207,0.6)' }}>{t.type}</Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textLight }}>
            {formatTime(t.departureTime)}
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(225,221,207,0.6)' }}>{t.origin}</Text>
        </View>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(225,221,207,0.3)' }} />
            <Ionicons name={transportIcon(t.type)} size={14} color="rgba(225,221,207,0.5)" />
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(225,221,207,0.3)' }} />
          </View>
          {t.carrier && (
            <Text style={{ fontSize: 11, color: 'rgba(225,221,207,0.6)', marginTop: 2 }}>
              {t.carrier} {t.flightNumber ?? ''}
            </Text>
          )}
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: colors.textLight }}>
            {formatTime(t.arrivalTime)}
          </Text>
          <Text style={{ fontSize: 11, color: 'rgba(225,221,207,0.6)' }}>{t.destination}</Text>
        </View>
      </View>

      {t.cost != null && (
        <Text style={{ fontSize: 13, color: 'rgba(225,221,207,0.7)', marginTop: 8 }}>
          {t.currency ?? 'USD'} {t.cost}
          {t.bookingRef ? ` · Ref: ${t.bookingRef}` : ''}
        </Text>
      )}
    </View>
  );
}

function AccomCard({
  a,
  type,
}: {
  a: NonNullable<Trip['accommodations']>[number];
  type: 'checkin' | 'checkout';
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderLeftWidth: 3,
        borderLeftColor: type === 'checkin' ? colors.success : colors.tabInactive,
      }}
    >
      <Ionicons
        name={type === 'checkin' ? 'bed' : 'exit-outline'}
        size={18}
        color={type === 'checkin' ? colors.success : colors.tabInactive}
      />
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textLight }}>
          {type === 'checkin' ? 'Check-in' : 'Check-out'}: {a.name}
        </Text>
        {a.address && (
          <Text style={{ fontSize: 12, color: colors.tabInactive, marginTop: 2 }}>{a.address}</Text>
        )}
        {a.cost != null && type === 'checkin' && (
          <Text style={{ fontSize: 12, color: colors.tabInactive, marginTop: 2 }}>
            {a.currency ?? 'USD'} {a.cost} · {formatDateShort(a.checkIn)} — {formatDateShort(a.checkOut)}
          </Text>
        )}
      </View>
    </View>
  );
}

function ItineraryItemRow({
  item,
}: {
  item: NonNullable<NonNullable<Trip['itineraryDays']>[number]['items']>[number];
}) {
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.surfaceLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        <Ionicons name={itemTypeIcon(item.type)} size={16} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textLight }}>{item.title}</Text>
        {item.description && (
          <Text style={{ fontSize: 13, color: colors.tabInactive, marginTop: 3, lineHeight: 18 }}>
            {item.description}
          </Text>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
          {item.startTime && (
            <Text style={{ fontSize: 12, color: colors.accent }}>
              {formatTime(item.startTime)}
              {item.endTime ? ` — ${formatTime(item.endTime)}` : ''}
            </Text>
          )}
          {item.location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              <Ionicons name="location-outline" size={11} color={colors.tabInactive} />
              <Text style={{ fontSize: 12, color: colors.tabInactive }}>{item.location}</Text>
            </View>
          )}
          {item.cost != null && (
            <Text style={{ fontSize: 12, color: colors.success }}>
              {item.currency ?? 'USD'} {item.cost}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const router = useRouter();
  const { lastTripUpdate } = useMaryAgent();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const isFirstLoad = useRef(true);

  const fetchTrip = useCallback(async (silent = false) => {
    if (!token || !id) return;
    if (!silent) setLoading(true);
    else setUpdating(true);
    try {
      const data = await api.getTrip(token, id);
      setTrip(data);
    } catch (e) {
      console.error('[TripDetail] Error:', e);
    } finally {
      setLoading(false);
      setUpdating(false);
      isFirstLoad.current = false;
    }
  }, [token, id]);

  // Initial load
  useEffect(() => {
    fetchTrip();
  }, [fetchTrip]);

  // Real-time updates when Mary modifies the trip
  useEffect(() => {
    if (lastTripUpdate > 0 && !isFirstLoad.current) {
      fetchTrip(true);
    }
  }, [lastTripUpdate, fetchTrip]);

  const timeline = useMemo(() => (trip ? buildTimeline(trip) : []), [trip]);
  const route = useMemo(() => (trip ? buildRoute(trip) : []), [trip]);

  const handleDelete = () => {
    Alert.alert('Eliminar viaje', '¿Estás seguro de que quieres eliminar este viaje?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          if (!token || !id) return;
          try {
            await api.deleteTrip(token, id);
            router.back();
          } catch {
            Alert.alert('Error', 'No se pudo eliminar el viaje');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <Text style={{ color: colors.tabInactive, fontSize: 16 }}>Viaje no encontrado</Text>
      </SafeAreaView>
    );
  }

  const isEmpty = timeline.length === 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={24} color={colors.textLight} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          {updating && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: colors.surfaceLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={{ fontSize: 12, color: colors.accent }}>Actualizando...</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleDelete} style={{ padding: 4 }}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>

        {/* Title + destination */}
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textLight }}>{trip.title}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
          <Ionicons name="location" size={15} color={colors.accent} />
          <Text style={{ fontSize: 15, color: colors.accent, marginLeft: 4 }}>{trip.destination}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <Ionicons name="calendar-outline" size={14} color={colors.tabInactive} />
          <Text style={{ fontSize: 13, color: colors.tabInactive, marginLeft: 4 }}>
            {formatDateShort(trip.startDate)}
            {trip.endDate ? ` — ${formatDateShort(trip.endDate)}` : ''}
          </Text>
        </View>

        {/* Route pills */}
        {route.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 16 }}
            contentContainerStyle={{ gap: 0, alignItems: 'center' }}
          >
            {route.map((stop, i) => (
              <View key={`${stop}-${i}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: i === 0 || i === route.length - 1 ? colors.primary : colors.surfaceLight,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textLight }}>{stop}</Text>
                </View>
                {i < route.length - 1 && (
                  <Ionicons name="chevron-forward" size={14} color={colors.tabInactive} style={{ marginHorizontal: 2 }} />
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Objectives */}
        {trip.objectives && (
          <Text style={{ fontSize: 14, color: colors.tabInactive, marginTop: 12, lineHeight: 20 }}>
            {trip.objectives}
          </Text>
        )}

        {/* Participants */}
        {trip.participants.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 6 }}>
            {trip.participants.map((p) => (
              <View
                key={p.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.surfaceLight,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  gap: 4,
                }}
              >
                <Ionicons name="person-outline" size={12} color={colors.accent} />
                <Text style={{ fontSize: 13, color: colors.textLight }}>{p.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Empty state */}
        {isEmpty && (
          <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
            <Ionicons name="map-outline" size={56} color={colors.surfaceLight} />
            <Text style={{ fontSize: 15, color: colors.tabInactive, textAlign: 'center', lineHeight: 22 }}>
              El itinerario está vacío.{'\n'}Pídele a Mary que planifique vuelos, hoteles y actividades.
            </Text>
          </View>
        )}

        {/* Unified timeline */}
        {!isEmpty && (
          <View style={{ marginTop: 28 }}>
            {timeline.map((day, dayIdx) => {
              const hasContent =
                day.transportsOut.length > 0 ||
                day.transportsIn.length > 0 ||
                day.accomCheckins.length > 0 ||
                day.accomCheckouts.length > 0 ||
                day.itineraryItems.length > 0;

              if (!hasContent) return null;

              // Detect city change (arrival to a new city)
              const isCityChange = day.transportsIn.length > 0;
              const prevDay = dayIdx > 0 ? timeline[dayIdx - 1] : null;
              const cityChanged = isCityChange && prevDay?.city !== day.city;

              return (
                <View key={day.dateKey}>
                  {/* City change banner */}
                  {cityChanged && day.city && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.surfaceLight,
                        borderRadius: 10,
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        marginBottom: 10,
                        gap: 8,
                      }}
                    >
                      <Ionicons name="location" size={16} color={colors.primary} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textLight }}>
                        Llegada a {day.city}
                      </Text>
                    </View>
                  )}

                  {/* Day header */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 10,
                      gap: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary,
                        marginLeft: 2,
                      }}
                    />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textLight }}>
                      {day.dateLabel}
                    </Text>
                    {day.city && !cityChanged && (
                      <Text style={{ fontSize: 13, color: colors.tabInactive }}>· {day.city}</Text>
                    )}
                  </View>

                  {/* Content with left timeline line */}
                  <View
                    style={{
                      marginLeft: 5,
                      paddingLeft: 16,
                      borderLeftWidth: 1,
                      borderLeftColor: colors.surfaceLight,
                      marginBottom: 20,
                    }}
                  >
                    {/* Transports OUT (departures) */}
                    {day.transportsOut.map((t) => (
                      <TransportCard key={`out-${t.id}`} t={t} />
                    ))}

                    {/* Accom check-outs */}
                    {day.accomCheckouts.map((a) => (
                      <AccomCard key={`checkout-${a.id}`} a={a} type="checkout" />
                    ))}

                    {/* Accom check-ins */}
                    {day.accomCheckins.map((a) => (
                      <AccomCard key={`checkin-${a.id}`} a={a} type="checkin" />
                    ))}

                    {/* Itinerary items sorted by time */}
                    {[...day.itineraryItems]
                      .sort((a, b) =>
                        a.startTime && b.startTime
                          ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                          : 0,
                      )
                      .map((item) => (
                        <ItineraryItemRow key={item.id} item={item} />
                      ))}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
