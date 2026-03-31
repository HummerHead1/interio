/**
 * Light haptic feedback for UI interactions.
 * Falls back silently on devices/browsers that don't support vibration.
 */

export function hapticLight() {
  navigator?.vibrate?.(10);
}

export function hapticMedium() {
  navigator?.vibrate?.(25);
}

export function hapticSuccess() {
  navigator?.vibrate?.([15, 50, 15]);
}

export function hapticHeavy() {
  navigator?.vibrate?.(40);
}
