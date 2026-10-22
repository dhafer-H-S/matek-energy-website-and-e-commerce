import { MetaPixel } from "./MetaPixel";
import { GoogleAnalytics } from "./GoogleAnalytics";

interface AnalyticsProps {
  metaPixelId?: string | null;
  gaMeasurementId?: string | null;
}

/** Server component that injects whichever analytics tags are configured. */
export function Analytics({ metaPixelId, gaMeasurementId }: AnalyticsProps) {
  return (
    <>
      {metaPixelId ? <MetaPixel pixelId={metaPixelId} /> : null}
      {gaMeasurementId ? <GoogleAnalytics id={gaMeasurementId} /> : null}
    </>
  );
}
