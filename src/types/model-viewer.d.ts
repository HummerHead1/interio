import "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          "ios-src"?: string;
          alt?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          "shadow-intensity"?: string;
          "shadow-softness"?: string;
          "tone-mapping"?: string;
          "environment-image"?: string;
          exposure?: string;
          "rotation-per-second"?: string;
          "interaction-prompt"?: string;
          "variant-name"?: string;
          poster?: string;
          loading?: string;
        },
        HTMLElement
      >;
    }
  }
}
