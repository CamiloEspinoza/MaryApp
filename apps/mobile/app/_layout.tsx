import '../global.css';

import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { ElevenLabsProvider } from '@elevenlabs/react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { MaryAgentProvider } from '../contexts/MaryAgentContext';
import { colors } from '../constants/theme';

function AuthGate() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inLoginScreen = segments[0] === 'login';

    if (!isAuthenticated && !inLoginScreen) {
      router.replace('/login');
    } else if (isAuthenticated && inLoginScreen) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ElevenLabsProvider>
        <MaryAgentProvider>
          <AuthGate />
        </MaryAgentProvider>
      </ElevenLabsProvider>
    </AuthProvider>
  );
}
