import { ComponentType, JSX } from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

type Presets = "default" | "filled" | "reversed" | "ghost";
type Size = "sm" | "md" | "lg";

export interface ButtonAccessoryProps {
  style: StyleProp<any>;
  pressableState: PressableStateCallbackType;
  disabled?: boolean;
}

export interface ButtonProps extends PressableProps {
  /**
   * The text to display if not using nested components.
   */
  text?: string;
  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>;
  /**
   * An optional style override for the "pressed" state.
   */
  pressedStyle?: StyleProp<ViewStyle>;
  /**
   * An optional style override for the button text.
   */
  textStyle?: StyleProp<TextStyle>;
  /**
   * An optional style override for the button text when in the "pressed" state.
   */
  pressedTextStyle?: StyleProp<TextStyle>;
  /**
   * An optional style override for the button text when in the "disabled" state.
   */
  disabledTextStyle?: StyleProp<TextStyle>;
  /**
   * One of the different types of button presets.
   */
  preset?: Presets;
  /**
   * The size of the button. Defaults to "lg".
   */
  size?: Size;
  /**
   * An optional component to render on the right side of the text.
   * Example: `RightAccessory={(props) => <View {...props} />}`
   */
  RightAccessory?: ComponentType<ButtonAccessoryProps>;
  /**
   * An optional component to render on the left side of the text.
   * Example: `LeftAccessory={(props) => <View {...props} />}`
   */
  LeftAccessory?: ComponentType<ButtonAccessoryProps>;
  /**
   * Children components.
   */
  children?: React.ReactNode;
  /**
   * disabled prop, accessed directly for declarative styling reasons.
   * https://reactnative.dev/docs/pressable#disabled
   */
  disabled?: boolean;
  /**
   * An optional style override for the disabled state
   */
  disabledStyle?: StyleProp<ViewStyle>;
  /**
   * Shows an ActivityIndicator in place of the button content when true.
   */
  isLoading?: boolean;
}

/**
 * A component that allows users to take actions and make choices.
 * Wraps the Text component with a Pressable component.
 * @see [Documentation and Examples]{@link https://docs.infinite.red/ignite-cli/boilerplate/app/components/Button/}
 * @param {ButtonProps} props - The props for the `Button` component.
 * @returns {JSX.Element} The rendered `Button` component.
 * @example
 * <Button
 *   text="OK"
 *   style={styles.button}
 *   textStyle={styles.buttonText}
 *   onPress={handleButtonPress}
 * />
 */
export function Button(props: ButtonProps): JSX.Element {
  const {
    text,
    style: $viewStyleOverride,
    pressedStyle: $pressedViewStyleOverride,
    textStyle: $textStyleOverride,
    pressedTextStyle: $pressedTextStyleOverride,
    disabledTextStyle: $disabledTextStyleOverride,
    children,
    RightAccessory,
    LeftAccessory,
    disabled,
    disabledStyle: $disabledViewStyleOverride,
    isLoading,
    size = "lg",
    ...rest
  } = props;

  const preset: Presets = props.preset ?? "default";
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<ViewStyle>} The view style based on the pressed state.
   */
  function $viewStyle({
    pressed,
  }: PressableStateCallbackType): StyleProp<ViewStyle> {
    return [
      ...$viewPresets[preset],
      $sizeViewPresets[size],
      $viewStyleOverride,
      !!pressed && [$pressedViewPresets[preset], $pressedViewStyleOverride],
      (!!disabled || !!isLoading) && styles.disabledView,
      (!!disabled || !!isLoading) && $disabledViewStyleOverride,
    ];
  }
  /**
   * @param {PressableStateCallbackType} root0 - The root object containing the pressed state.
   * @param {boolean} root0.pressed - The pressed state.
   * @returns {StyleProp<TextStyle>} The text style based on the pressed state.
   */
  function $textStyle({
    pressed,
  }: PressableStateCallbackType): StyleProp<TextStyle> {
    return [
      ...$textPresets[preset],
      $sizeTextPresets[size],
      $textStyleOverride,
      !!pressed && [$pressedTextPresets[preset], $pressedTextStyleOverride],
      (!!disabled || !!isLoading) && styles.disabledText,
      (!!disabled || !!isLoading) && $disabledTextStyleOverride,
    ];
  }

  return (
    <Pressable
      style={$viewStyle}
      accessibilityRole="button"
      accessibilityState={{
        disabled: !!disabled || !!isLoading,
        busy: !!isLoading,
      }}
      {...rest}
      disabled={disabled || isLoading}
    >
      {(state) => (
        <>
          {!!LeftAccessory && (
            <LeftAccessory
              style={$leftAccessoryStyle}
              pressableState={state}
              disabled={disabled}
            />
          )}
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={preset === "reversed" ? "#F4F2F1" : "#ED5623"}
              style={styles.loader}
            />
          )}

          <Text style={$textStyle(state)}>
            {text}
            {children}
          </Text>

          {!!RightAccessory && (
            <RightAccessory
              style={$rightAccessoryStyle}
              pressableState={state}
              disabled={disabled}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  baseView: {
    minHeight: 56,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    overflow: "hidden",
  },
  baseText: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: "center",
    flexShrink: 1,
    flexGrow: 0,
    zIndex: 2,
  },
  rightAccessory: {
    marginStart: 4,
    zIndex: 1,
  },
  leftAccessory: {
    marginRight: 16,
    zIndex: 1,
  },
  disabledView: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.5,
  },
  loader: {
    marginEnd: 8,
  },
});

const $rightAccessoryStyle = styles.rightAccessory;
const $leftAccessoryStyle = styles.leftAccessory;

const $sizeViewPresets: Record<Size, ViewStyle> = {
  sm: { minHeight: 36, paddingVertical: 6, paddingHorizontal: 12 },
  md: { minHeight: 44, paddingVertical: 8, paddingHorizontal: 16 },
  lg: { minHeight: 56, paddingVertical: 12, paddingHorizontal: 24 },
};

const $sizeTextPresets: Record<Size, TextStyle> = {
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 15, lineHeight: 20 },
  lg: { fontSize: 16, lineHeight: 20 },
};

const $viewPresets: Record<Presets, ViewStyle[]> = {
  default: [
    styles.row,
    styles.baseView,
    { borderWidth: 1, borderColor: "#B6ACA6", backgroundColor: "#F4F2F1" },
  ],
  filled: [styles.row, styles.baseView, { backgroundColor: "#ED5623" }],
  reversed: [styles.row, styles.baseView, { backgroundColor: "#191015" }],
  ghost: [styles.row, styles.baseView, { backgroundColor: "transparent" }],
};

const $textPresets: Record<Presets, TextStyle[]> = {
  default: [styles.baseText],
  filled: [styles.baseText, { color: "#F4F2F1" }],
  reversed: [styles.baseText, { color: "#F4F2F1" }],
  ghost: [styles.baseText, { color: "#11181C" }],
};

const $pressedViewPresets: Record<Presets, ViewStyle> = {
  default: { backgroundColor: "#E8E6E1" },
  filled: { backgroundColor: "#c5471d" },
  reversed: { backgroundColor: "#3C3836" },
  ghost: {},
};

const $pressedTextPresets: Record<Presets, TextStyle> = {
  default: { opacity: 0.9 },
  filled: { opacity: 0.9 },
  reversed: { opacity: 0.9 },
  ghost: { opacity: 0.9 },
};
