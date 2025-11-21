/**
 * Simple utility to detect if the current device is mobile or desktop
 */

let cachedIsMobile: boolean | null = null;

/**
 * Checks if the current device is mobile based on user agent and touch capability
 * @returns true if mobile device, false if desktop
 */
export function isMobile(): boolean {
    if (cachedIsMobile !== null) {
        return cachedIsMobile;
    }

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const hasMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());

    const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const hasSmallScreen = window.innerWidth <= 768;

    cachedIsMobile = hasMobileUserAgent || (hasTouchScreen && hasSmallScreen);

    return cachedIsMobile;
}

/**
 * Checks if the current device is desktop
 * @returns true if desktop device, false if mobile
 */
export function isDesktop(): boolean {
    return !isMobile();
}

/**
 * Resets the cached device detection (useful for testing or window resize scenarios)
 */
export function resetDeviceDetection(): void {
    cachedIsMobile = null;
}
