import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../constants/theme';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type Step = 'email' | 'otp';

export default function LoginScreen() {
  const { login } = useAuth();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(TextInput | null)[]>([]);

  const handleSendOtp = useCallback(async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Ingresa un correo electrónico válido');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await api.sendOtp(trimmed);
      setStep('otp');
    } catch (err: any) {
      setError(err.message ?? 'Error al enviar el código');
    } finally {
      setLoading(false);
    }
  }, [email]);

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      setError('');
      setLoading(true);
      try {
        const result = await api.verifyOtp(email.trim().toLowerCase(), code);
        await login(result.token, result.user);
      } catch (err: any) {
        setError(err.message ?? 'Código inválido');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [email, login],
  );

  const handleOtpChange = useCallback(
    (text: string, index: number) => {
      // Only allow digits
      const digit = text.replace(/[^0-9]/g, '').slice(-1);
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits entered
      const code = newOtp.join('');
      if (code.length === 6 && !newOtp.includes('')) {
        handleVerifyOtp(code);
      }
    },
    [otp, handleVerifyOtp],
  );

  const handleOtpKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !otp[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    },
    [otp],
  );

  const handleResend = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      await api.sendOtp(email.trim().toLowerCase());
      Alert.alert('Código reenviado', 'Revisa tu correo electrónico');
    } catch (err: any) {
      setError(err.message ?? 'Error al reenviar');
    } finally {
      setLoading(false);
    }
  }, [email]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}
        testID="login-screen"
      >
        {/* Logo */}
        <Text
          style={{
            fontSize: 48,
            fontWeight: '700',
            color: colors.primary,
            marginBottom: 4,
          }}
        >
          Mary
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.accent,
            marginBottom: 48,
          }}
        >
          Tu guía turística personal
        </Text>

        {step === 'email' ? (
          /* ── Email Step ── */
          <View style={{ width: '100%' }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textLight,
                marginBottom: 8,
                fontWeight: '500',
              }}
            >
              Correo electrónico
            </Text>
            <TextInput
              testID="email-input"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setError('');
              }}
              placeholder="tu@email.com"
              placeholderTextColor={colors.tabInactive}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!loading}
              onSubmitEditing={handleSendOtp}
              returnKeyType="go"
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                color: colors.textLight,
                borderWidth: 1,
                borderColor: error ? colors.primary : colors.surfaceLight,
              }}
            />
            {error ? (
              <Text
                style={{ color: colors.primary, fontSize: 13, marginTop: 8 }}
              >
                {error}
              </Text>
            ) : null}
            <Pressable
              testID="send-otp-button"
              onPress={handleSendOtp}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
                marginTop: 16,
                opacity: loading ? 0.6 : pressed ? 0.8 : 1,
              })}
            >
              {loading ? (
                <ActivityIndicator color={colors.textLight} />
              ) : (
                <Text
                  style={{
                    color: colors.textLight,
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Enviar código
                </Text>
              )}
            </Pressable>
          </View>
        ) : (
          /* ── OTP Step ── */
          <View style={{ width: '100%', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textLight,
                marginBottom: 4,
                textAlign: 'center',
              }}
            >
              Ingresa el código de 6 dígitos
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.tabInactive,
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              Enviado a {email}
            </Text>

            {/* OTP inputs */}
            <View
              style={{
                flexDirection: 'row',
                gap: 8,
                marginBottom: 16,
              }}
            >
              {otp.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => {
                    otpRefs.current[i] = ref;
                  }}
                  testID={`otp-input-${i}`}
                  value={digit}
                  onChangeText={(t) => handleOtpChange(t, i)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(nativeEvent.key, i)
                  }
                  keyboardType="number-pad"
                  maxLength={1}
                  editable={!loading}
                  selectTextOnFocus
                  style={{
                    width: 48,
                    height: 56,
                    backgroundColor: colors.surface,
                    borderRadius: 10,
                    borderWidth: 1.5,
                    borderColor: digit
                      ? colors.primary
                      : error
                        ? colors.danger
                        : colors.surfaceLight,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.textLight,
                  }}
                />
              ))}
            </View>

            {error ? (
              <Text
                style={{ color: colors.primary, fontSize: 13, marginBottom: 8 }}
              >
                {error}
              </Text>
            ) : null}

            {loading ? (
              <ActivityIndicator
                color={colors.primary}
                style={{ marginTop: 16 }}
              />
            ) : null}

            <Pressable
              onPress={handleResend}
              disabled={loading}
              style={{ marginTop: 24 }}
            >
              <Text style={{ color: colors.accent, fontSize: 14 }}>
                Reenviar código
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                setStep('email');
                setOtp(['', '', '', '', '', '']);
                setError('');
              }}
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: colors.tabInactive, fontSize: 14 }}>
                Cambiar correo
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
