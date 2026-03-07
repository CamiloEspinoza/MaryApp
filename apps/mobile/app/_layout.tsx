import '../global.css';

import { Slot } from 'expo-router';
import { ElevenLabsProvider } from '@elevenlabs/react-native';

export default function RootLayout() {
  return (
    <ElevenLabsProvider>
      <Slot />
    </ElevenLabsProvider>
  );
}
