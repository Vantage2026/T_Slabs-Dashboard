/**
 * Public FedEx tracking URL (no API key). Opens the same page as "Track" on fedex.com.
 */
function fedexPublicTrackUrl(trackingNumber) {
  const n = String(trackingNumber).replace(/\s/g, "");
  return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`;
}

function isSkipFedExApi() {
  const v = process.env.SKIP_FEDEX_API;
  return v === "1" || v === "true" || v === "yes";
}

module.exports = { fedexPublicTrackUrl, isSkipFedExApi };
