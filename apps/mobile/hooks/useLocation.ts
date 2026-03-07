import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  country: string | null;
  address: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    city: null,
    country: null,
    address: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'Permiso de ubicación denegado',
          }));
        }
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (mounted) {
          setState({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            city: geocode?.city ?? null,
            country: geocode?.country ?? null,
            address: geocode
              ? [geocode.street, geocode.city, geocode.region, geocode.country]
                  .filter(Boolean)
                  .join(', ')
              : null,
            isLoading: false,
            error: null,
          });
        }
      } catch (err) {
        if (mounted) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: 'No se pudo obtener la ubicación',
          }));
        }
      }
    }

    getLocation();
    return () => {
      mounted = false;
    };
  }, []);

  const contextString = state.city
    ? `El usuario está en ${state.city}, ${state.country}. Coordenadas: ${state.latitude}, ${state.longitude}. Dirección aproximada: ${state.address}.`
    : state.isLoading
      ? 'Obteniendo ubicación del usuario...'
      : 'Ubicación no disponible.';

  return { ...state, contextString };
}
