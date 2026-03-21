/**
 * WebGL Support Detection Utility
 * Detects if the browser supports WebGL/WebGL2 rendering
 */

export interface WebGLInfo {
  supported: boolean;
  version: 'webgl' | 'webgl2' | null;
  renderer?: string;
  vendor?: string;
}

/**
 * Check if WebGL is supported in the current browser
 * @returns boolean indicating WebGL support
 */
export function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return !!gl;
  } catch (error) {
    console.warn('WebGL detection failed:', error);
    return false;
  }
}

/**
 * Get detailed WebGL information for debugging
 * @returns WebGLInfo object with support status and details
 */
export function getWebGLInfo(): WebGLInfo {
  try {
    const canvas = document.createElement('canvas');

    // Try WebGL2 first
    let gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext('webgl2') as WebGL2RenderingContext | null;
    let version: 'webgl' | 'webgl2' | null = gl ? 'webgl2' : null;

    // Fallback to WebGL1
    if (!gl) {
      gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
      version = gl ? 'webgl' : null;
    }

    if (!gl) {
      return { supported: false, version: null };
    }

    // Get renderer info if available
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : undefined;
    const vendor = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : undefined;

    return {
      supported: true,
      version,
      renderer: renderer as string | undefined,
      vendor: vendor as string | undefined,
    };
  } catch (error) {
    console.warn('WebGL info retrieval failed:', error);
    return { supported: false, version: null };
  }
}
