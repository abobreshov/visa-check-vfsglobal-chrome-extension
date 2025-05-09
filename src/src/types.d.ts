/**
 * Global type declarations
 */

// Extend the Window interface to include our custom properties
interface Window {
  __vfsSlotCheckerLoaded?: boolean;
  __VFS_RUNNING__?: boolean;
}