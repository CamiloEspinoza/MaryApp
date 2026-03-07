import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

export default function PerfilScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
      }}
      testID="perfil-screen"
    >
      <StatusBar style="light" />
      <Ionicons name="person-circle" size={80} color={colors.surfaceLight} />
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.textLight,
          marginTop: 16,
        }}
      >
        Perfil
      </Text>
      <Text
        style={{
          fontSize: 15,
          color: colors.tabInactive,
          marginTop: 8,
          textAlign: 'center',
        }}
      >
        Tu cuenta y preferencias
      </Text>
    </View>
  );
}
