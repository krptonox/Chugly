import { useCallback, useState } from "react";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GeolocationStatus =
  | "idle"
  | "loading"
  | "success"
  | "permission-denied"
  | "unavailable"
  | "timeout"
  | "unsupported";

type GeolocationState = {
  coordinates: Coordinates | null;
  status: GeolocationStatus;
  errorMessage: string;
};

const getErrorState = (error: GeolocationPositionError) => {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      status: "permission-denied" as const,
      errorMessage:
        "Location permission was denied. Allow location access to find nearby rooms.",
    };
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return {
      status: "unavailable" as const,
      errorMessage:
        "Your current location is unavailable. Check your device location settings and try again.",
    };
  }

  return {
    status: "timeout" as const,
    errorMessage:
      "Finding your location took too long. Please try again.",
  };
};

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    status: "idle",
    errorMessage: "",
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setState({
        coordinates: null,
        status: "unsupported",
        errorMessage:
          "This browser does not support location services.",
      });
      return;
    }

    setState((current) => ({
      ...current,
      status: "loading",
      errorMessage: "",
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          status: "success",
          errorMessage: "",
        });
      },
      (error) => {
        const nextState = getErrorState(error);
        setState({
          coordinates: null,
          ...nextState,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  return {
    ...state,
    requestLocation,
  };
}
