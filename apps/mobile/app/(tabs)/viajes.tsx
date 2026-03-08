import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback, memo } from 'react';
import { useFocusEffect } from 'expo-router';
import { colors } from '../../constants/theme';
import { api, type Trip } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { useMaryAgent } from '../../hooks/useMaryAgent';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' });
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PLANNING: { label: 'Planificando', color: '#F59E0B' },
  ACTIVE: { label: 'Activo', color: colors.success },
  COMPLETED: { label: 'Completado', color: colors.tabInactive },
  CANCELLED: { label: 'Cancelado', color: colors.danger },
};

const TripCard = memo(function TripCard({ trip, onPress }: { trip: Trip; onPress: () => void }) {
  const status = statusLabels[trip.status] ?? statusLabels.PLANNING;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.card}>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>{trip.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
          <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.cardRow}>
        <Ionicons name="location" size={14} color={colors.accent} />
        <Text style={styles.cardDestination}>{trip.destination}</Text>
      </View>

      <View style={styles.cardRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.tabInactive} />
        <Text style={styles.cardDate}>
          {formatDate(trip.startDate)}
          {trip.endDate ? ` — ${formatDate(trip.endDate)}` : ''}
        </Text>
      </View>

      {trip.participants.length > 0 && (
        <View style={styles.cardRow}>
          <Ionicons name="people-outline" size={14} color={colors.tabInactive} />
          <Text style={styles.cardDate}>
            {trip.participants.map((p) => p.name).join(', ')}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

export default function ViajesScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const { lastTripUpdate } = useMaryAgent();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrips = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading((prev) => (trips.length === 0 ? true : prev));
    try {
      const data = await api.getTrips(token);
      setTrips(data);
    } catch (e) {
      console.error('[Viajes] Error fetching trips:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, trips.length]);

  useEffect(() => {
    fetchTrips();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (lastTripUpdate > 0) {
      fetchTrips(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTripUpdate]);

  useFocusEffect(
    useCallback(() => {
      fetchTrips(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, [fetchTrips]);

  const renderItem = useCallback(({ item }: { item: Trip }) => (
    <TripCard
      trip={item}
      onPress={() => router.push(`/viaje/${item.id}`)}
    />
  ), [router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Viajes</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : trips.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="airplane-outline" size={64} color={colors.surfaceLight} />
          <Text style={styles.emptyTitle}>Sin viajes todavía</Text>
          <Text style={styles.emptySubtitle}>
            Pídele a Mary que te ayude a planificar tu próximo viaje
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textLight,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.tabInactive,
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cardDestination: {
    fontSize: 14,
    color: colors.accent,
    marginLeft: 4,
  },
  cardDate: {
    fontSize: 13,
    color: colors.tabInactive,
    marginLeft: 4,
  },
});
