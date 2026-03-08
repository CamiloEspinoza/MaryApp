import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  withSequence,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const haptic = (style: Haptics.ImpactFeedbackStyle) => {
  Haptics.impactAsync(style).catch(() => {});
};
import { useMaryAgent, type ToolEvent, type ResultItem } from '../../hooks/useMaryAgent';
import { colors } from '../../constants/theme';

// ─── Pulsing ring ─────────────────────────────────────────────────────────────

function PulsingRing({ active }: { active: boolean }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 1000, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.in(Easing.ease) }),
        ),
        -1,
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 }),
        ),
        -1,
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [active]);

  return (
    <Animated.View style={[styles.pulsingRing, animatedStyle]} />
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ item, onSelect }: { item: ResultItem; onSelect: (item: ResultItem) => void }) {
  const translateY = useSharedValue(12);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    translateY.value = withSpring(0, { stiffness: 80, damping: 10 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const isWebResult = item.subtitle?.startsWith('http');

  return (
    <Animated.View style={[styles.resultCard, animatedStyle]}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.resultCardImage}
          resizeMode="cover"
        />
      ) : null}

      <View style={styles.resultCardBody}>
        <View style={styles.resultCardTitleRow}>
          <View style={styles.resultCardTitleContainer}>
            <Text style={styles.resultCardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.subtitle ? (
              <Text
                style={[styles.resultCardSubtitle, isWebResult && styles.resultCardSubtitleLink]}
                numberOfLines={1}
                onPress={isWebResult ? () => Linking.openURL(item.subtitle!) : undefined}
              >
                {isWebResult ? '🔗 ' : ''}{item.subtitle}
              </Text>
            ) : null}
            {item.detail ? (
              <Text style={styles.resultCardDetail} numberOfLines={3}>
                {item.detail}
              </Text>
            ) : null}
          </View>

          {item.price ? (
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>{item.price}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.resultCardFooter}>
          {item.meta ? (
            <Text style={styles.resultCardMeta}>{item.meta}</Text>
          ) : <View />}

          <Pressable
            onPress={() => {
              haptic(Haptics.ImpactFeedbackStyle.Light);
              onSelect(item);
            }}
            style={({ pressed }) => [styles.selectButton, pressed && styles.selectButtonPressed]}
          >
            <Ionicons name="checkmark" size={14} color={colors.textLight} />
            <Text style={styles.selectButtonText}>Seleccionar</Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Tool event chip ──────────────────────────────────────────────────────────

const TOOL_ICON_MAP: Record<string, { bg: string; color: string }> = {
  search_flights: { bg: '#1a2a4a', color: '#5b9bd5' },
  search_hotels: { bg: '#2a1a3a', color: '#b57be0' },
  search_places: { bg: '#1a3a2a', color: '#5bd58a' },
  search_web: { bg: '#2a2a1a', color: '#d5c45b' },
  create_trip: { bg: '#3a1a1a', color: '#d55b5b' },
  add_transportation: { bg: '#1a2a3a', color: '#5ba8d5' },
  add_accommodation: { bg: '#2a1a2a', color: '#d55ba8' },
  add_itinerary_item: { bg: '#1a3a3a', color: '#5bd5c4' },
  save_memory: { bg: '#3a2a1a', color: '#d5a45b' },
  recall_memory: { bg: '#2a3a1a', color: '#a4d55b' },
  get_my_trips: { bg: '#1a2a1a', color: '#5bd55b' },
};

function ToolEventChip({
  event,
  onSelect,
}: {
  event: ToolEvent;
  onSelect: (item: ResultItem) => void;
}) {
  const translateY = useSharedValue(8);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    translateY.value = withSpring(0, { stiffness: 100, damping: 12 });
    opacity.value = withTiming(1, { duration: 200 });
  }, []);

  const isDone = event.status === 'done';
  const hasResults = isDone && event.results && event.results.length > 0;
  const colorScheme = TOOL_ICON_MAP[event.name] ?? { bg: colors.surfaceLight, color: colors.accent };

  return (
    <Animated.View style={[animatedStyle, { marginBottom: hasResults ? 2 : 8 }]}>
      <View style={[
        styles.chipHeader,
        { borderColor: isDone ? colors.surfaceLight : colorScheme.color + '40' },
        hasResults && styles.chipHeaderWithResults,
      ]}>
        <View style={[styles.chipIconCircle, { backgroundColor: colorScheme.bg }]}>
          {isDone ? (
            <Ionicons name="checkmark-circle" size={18} color={colorScheme.color} />
          ) : (
            <Ionicons name={event.icon as any} size={16} color={colorScheme.color} />
          )}
        </View>

        <View style={styles.chipTextContainer}>
          <Text style={[styles.chipLabel, isDone && styles.chipLabelDone]}>
            {event.label}
          </Text>
          {event.message && isDone ? (
            <Text style={styles.chipMessage} numberOfLines={1}>
              {event.message}
            </Text>
          ) : null}
        </View>

        {!isDone && (
          <ActivityIndicator size="small" color={colorScheme.color} />
        )}
      </View>

      {hasResults && event.results!.map((item) => (
        <ResultCard key={item.id} item={item} onSelect={onSelect} />
      ))}
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function MaryScreen() {
  const { status, isSpeaking, isMuted, toolEvents, startConversation, endConversation, toggleMute, sendSelection, clearToolEvents, location } =
    useMaryAgent();
  const scrollRef = useRef<ScrollView>(null);

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  useEffect(() => {
    if (toolEvents.length > 0) {
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [toolEvents.length]);

  const handlePress = async () => {
    if (isConnected) {
      haptic(Haptics.ImpactFeedbackStyle.Medium);
      await endConversation();
    } else if (!isConnecting) {
      haptic(Haptics.ImpactFeedbackStyle.Medium);
      await startConversation();
    }
  };

  const handleMute = () => {
    haptic(Haptics.ImpactFeedbackStyle.Light);
    toggleMute();
  };

  const handleSelect = (item: ResultItem) => {
    const msg = `Selecciono "${item.title}"${item.price ? ` (${item.price})` : ''}`;
    sendSelection(msg);
  };

  const statusText = isConnecting
    ? 'Conectando...'
    : isMuted
      ? 'Micrófono silenciado'
      : isConnected && isSpeaking
        ? 'Mary está hablando...'
        : isConnected
          ? 'Escuchando...'
          : 'Toca para hablar con Mary';

  const locationText = location.city
    ? `${location.city}, ${location.country}`
    : location.isLoading
      ? 'Obteniendo ubicación...'
      : '';

  return (
    <View style={styles.container} testID="mary-screen">
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mary</Text>
        <Text style={styles.headerSubtitle}>Guía turística personal</Text>
        {locationText ? (
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={colors.accent} />
            <Text style={styles.locationText}>{locationText}</Text>
          </View>
        ) : null}
      </View>

      {/* Tool events feed */}
      {toolEvents.length > 0 ? (
        <ScrollView
          ref={scrollRef}
          style={styles.feedScroll}
          contentContainerStyle={styles.feedContent}
          showsVerticalScrollIndicator={false}
        >
          {toolEvents.map((event) => (
            <ToolEventChip key={event.id} event={event} onSelect={handleSelect} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyFeed}>
          {!isConnected && (
            <Text style={styles.emptyText}>
              Habla con Mary para planificar tu próximo viaje
            </Text>
          )}
        </View>
      )}

      {/* Status */}
      <View style={styles.statusRow}>
        <View style={styles.statusInner}>
          {isConnected && isSpeaking && (
            <View style={styles.speakingDot} />
          )}
          <Text style={[styles.statusText, isConnected && styles.statusTextActive]}>
            {statusText}
          </Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>

        {/* Mute button */}
        {isConnected ? (
          <Pressable
            onPress={handleMute}
            testID="mary-mute-button"
            style={({ pressed }) => [
              styles.sideButton,
              isMuted && styles.sideButtonActive,
              pressed && styles.sideButtonPressed,
            ]}
          >
            <Ionicons
              name={isMuted ? 'mic-off' : 'mic-outline'}
              size={20}
              color={isMuted ? colors.textLight : colors.tabInactive}
            />
          </Pressable>
        ) : (
          <View style={styles.sideButtonPlaceholder} />
        )}

        {/* Main voice button */}
        <View style={styles.voiceButtonContainer}>
          <PulsingRing active={isConnected && isSpeaking && !isMuted} />
          <Pressable
            onPress={handlePress}
            disabled={isConnecting}
            testID="mary-voice-button"
            style={({ pressed }) => [
              styles.voiceButton,
              isConnected && (isMuted ? styles.voiceButtonMuted : styles.voiceButtonActive),
              isConnecting && styles.voiceButtonConnecting,
              pressed && styles.voiceButtonPressed,
            ]}
          >
            <Ionicons
              name={isConnecting ? 'ellipsis-horizontal' : isConnected ? 'close' : 'mic'}
              size={32}
              color={colors.textLight}
            />
          </Pressable>
        </View>

        {/* Clear events button */}
        {isConnected && toolEvents.length > 0 ? (
          <Pressable
            onPress={() => {
              haptic(Haptics.ImpactFeedbackStyle.Light);
              clearToolEvents();
            }}
            style={({ pressed }) => [styles.sideButton, pressed && styles.sideButtonPressed]}
          >
            <Ionicons name="trash-outline" size={20} color={colors.tabInactive} />
          </Pressable>
        ) : (
          <View style={styles.sideButtonPlaceholder} />
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textLight,
    letterSpacing: 1.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.accent,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: colors.accent,
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  emptyFeed: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.tabInactive,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  statusRow: {
    alignItems: 'center',
    paddingBottom: 12,
  },
  statusInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  statusText: {
    fontSize: 14,
    color: colors.tabInactive,
    fontWeight: '500',
  },
  statusTextActive: {
    color: colors.accent,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 110,
    gap: 32,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  sideButtonActive: {
    backgroundColor: colors.primary + 'cc',
    borderColor: colors.primary,
  },
  sideButtonPressed: {
    opacity: 0.7,
  },
  sideButtonPlaceholder: {
    width: 50,
  },
  voiceButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulsingRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
  },
  voiceButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  voiceButtonActive: {
    borderWidth: 2,
    borderColor: colors.accent + '60',
  },
  voiceButtonMuted: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 2,
    borderColor: colors.accent + '60',
  },
  voiceButtonConnecting: {
    opacity: 0.5,
  },
  voiceButtonPressed: {
    opacity: 0.85,
  },
  // Result card
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    overflow: 'hidden',
  },
  resultCardImage: {
    width: '100%',
    height: 140,
  },
  resultCardBody: {
    padding: 14,
  },
  resultCardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  resultCardTitleContainer: {
    flex: 1,
  },
  resultCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textLight,
    lineHeight: 20,
  },
  resultCardSubtitle: {
    fontSize: 12,
    color: colors.tabInactive,
    marginTop: 3,
  },
  resultCardSubtitleLink: {
    color: colors.accent,
  },
  resultCardDetail: {
    fontSize: 13,
    color: colors.textLight,
    opacity: 0.7,
    marginTop: 5,
    lineHeight: 18,
  },
  priceBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    flexShrink: 0,
  },
  priceBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textLight,
  },
  resultCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  resultCardMeta: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  selectButtonPressed: {
    opacity: 0.7,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  // Tool event chip
  chipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 10,
  },
  chipHeaderWithResults: {
    marginBottom: 10,
  },
  chipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipTextContainer: {
    flex: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  chipLabelDone: {
    color: colors.tabInactive,
  },
  chipMessage: {
    fontSize: 11,
    color: colors.tabInactive,
    marginTop: 2,
  },
});
