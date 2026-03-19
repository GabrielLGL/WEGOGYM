/**
 * Mock global pour ToastContext — utilisé dans les tests Jest.
 * Évite l'erreur "useToast must be used within a ToastProvider".
 */

const mockShowToast = jest.fn()

export function useToast() {
  return { showToast: mockShowToast }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return children as React.ReactElement
}
