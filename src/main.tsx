import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Suppress findDOMNode warning from ReactQuill (known issue in react-quill library)
// This must be set up before React renders anything
const originalError = console.error;
const originalWarn = console.warn;

const shouldSuppressWarning = (...args: any[]): boolean => {
  // Check all arguments for findDOMNode related messages
  return args.some((arg) => {
    if (typeof arg === 'string') {
      return (
        arg.includes('findDOMNode is deprecated') ||
        arg.includes('findDOMNode') ||
        arg.includes('Warning: findDOMNode') ||
        arg.includes('findDOMNode is deprecated and will be removed')
      );
    }
    // Also check if it's an object with a message property
    if (typeof arg === 'object' && arg !== null) {
      const message = arg.message || arg.toString();
      if (typeof message === 'string') {
        return message.includes('findDOMNode');
      }
    }
    return false;
  });
};

console.error = (...args: any[]) => {
  if (shouldSuppressWarning(...args)) {
    // Suppress the findDOMNode warning from ReactQuill
    return;
  }
  originalError.apply(console, args);
};

console.warn = (...args: any[]) => {
  if (shouldSuppressWarning(...args)) {
    // Suppress the findDOMNode warning from ReactQuill
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
