import { useCallback, useState } from "react";
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";

const BOTTOM_THRESHOLD = 16;

export function useScrollToBottom() {
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const onViewportLayout = useCallback((event: LayoutChangeEvent) => {
    setViewportHeight(event.nativeEvent.layout.height);
  }, []);

  const onContentLayout = useCallback((event: LayoutChangeEvent) => {
    setContentHeight(event.nativeEvent.layout.height);
  }, []);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { layoutMeasurement, contentOffset, contentSize } =
        event.nativeEvent;
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - BOTTOM_THRESHOLD
      ) {
        setHasReachedBottom(true);
      }
    },
    [],
  );

  const contentFits =
    viewportHeight > 0 &&
    contentHeight > 0 &&
    contentHeight <= viewportHeight + BOTTOM_THRESHOLD;

  return {
    hasReachedBottom: hasReachedBottom || contentFits,
    onScroll,
    onContentLayout,
    onViewportLayout,
  };
}