import { View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useMaryAgent } from '../../hooks/useMaryAgent';
import { colors } from '../../constants/theme';

function PulsingRing({ active }: { active: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (active) {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.5,
              duration: 1200,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 1200,
              easing: Easing.in(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.6,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      scale.setValue(1);
      opacity.setValue(0);
    }
  }, [active, scale, opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        transform: [{ scale }],
        opacity,
      }}
    />
  );
}

export default function MaryScreen() {
  const { status, isSpeaking, startConversation, endConversation, location } =
    useMaryAgent();

  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';

  const handlePress = async () => {
    if (isConnected) {
      await endConversation();
    } else if (!isConnecting) {
      await startConversation();
    }
  };

  const statusText = isConnecting
    ? 'Conectando...'
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
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
      testID="mary-screen"
    >
      <StatusBar style="light" />

      {/* Header area */}
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
        <Text
          style={{
            fontSize: 32,
            fontWeight: '700',
            color: colors.textLight,
            letterSpacing: 1,
          }}
        >
          Mary
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.accent,
            marginTop: 4,
          }}
        >
          Tu guía turística personal
        </Text>
        {locationText ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <Ionicons name="location" size={14} color={colors.accent} />
            <Text style={{ fontSize: 13, color: colors.accent, marginLeft: 4 }}>
              {locationText}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Status indicator */}
      <View style={{ alignItems: 'center', paddingBottom: 16 }}>
        <Text
          style={{
            fontSize: 15,
            color: isConnected ? colors.accent : colors.tabInactive,
            fontWeight: '500',
          }}
        >
          {statusText}
        </Text>
      </View>

      {/* Voice button area */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingBottom: 120,
        }}
      >
        <PulsingRing active={isConnected} />
        <Pressable
          onPress={handlePress}
          disabled={isConnecting}
          testID="mary-voice-button"
          style={({ pressed }) => ({
            width: 88,
            height: 88,
            borderRadius: 44,
            backgroundColor: isConnected ? colors.accent : colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isConnecting ? 0.5 : pressed ? 0.8 : 1,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          })}
        >
          <Ionicons
            name={isConnecting ? 'ellipsis-horizontal' : isConnected ? 'close' : 'mic'}
            size={36}
            color={colors.textLight}
          />
        </Pressable>
      </View>
    </View>
  );
}
