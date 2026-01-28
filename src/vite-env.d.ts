/// <reference types="vite/client" />

// CSS modules type declaration
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Plain CSS import
declare module '*.css?inline' {
  const content: string;
  export default content;
}
