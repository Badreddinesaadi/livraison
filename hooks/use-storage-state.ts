import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useReducer } from "react";
import { Platform } from "react-native";
type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

async function save(key: string, value: string) {
  await SecureStore.setItemAsync(key, value);
}

async function getValueFor(key: string) {
  let result = await SecureStore.getItemAsync(key);
  if (result) {
  } else {
    console.log("No values stored under in key: " + key);
  }
  return result;
}

async function deleteValue(key: string) {
  await SecureStore.deleteItemAsync(key);
}

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null,
    ): [boolean, T | null] => [false, action],
    initialValue,
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        await deleteValue(key);
      } else {
        await save(key, value);
      }
    } catch (e) {
      console.error("Secure store  is unavailable:", e);
    }
  } else {
    if (value == null) {
      await deleteValue(key);
    } else {
      await save(key, value);
    }
  }
}

export function useStorageState(key: string): UseStateHook<string> {
  // Public
  const [state, setState] = useAsyncState<string>();

  // Get
  useEffect(() => {
    getValueFor(key).then((value: string | null) => {
      setState(value);
    });
  }, [key, setState]);
  // Set
  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value);
    },
    [key, setState],
  );

  return [state, setValue];
}
