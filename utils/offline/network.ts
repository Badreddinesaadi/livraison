import { onlineManager } from "@tanstack/react-query";
import * as Network from "expo-network";

const computeOnline = (state: Network.NetworkState) =>
  Boolean(state.isConnected) && state.isInternetReachable !== false;

/**
 * Binds TanStack's onlineManager to the device network state so queries pause
 * offline (serving cache) and auto-refresh + resume mutations on reconnect.
 */
export const setupOnlineManager = () => {
  onlineManager.setEventListener((setOnline) => {
    const subscription = Network.addNetworkStateListener((state) => {
      setOnline(computeOnline(state));
    });

    void Network.getNetworkStateAsync()
      .then((state) => setOnline(computeOnline(state)))
      .catch(() => undefined);

    return () => subscription.remove();
  });
};
