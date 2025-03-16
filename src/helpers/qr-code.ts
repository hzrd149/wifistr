export type WifiCode = {
  ssid?: string;
  securityType?: string;
  password?: string;
  hidden?: boolean;
};

export function parseWifiQrCode(data: string): WifiCode | null {
  if (!data.startsWith("WIFI:") || !data.endsWith(";;")) {
    return null;
  }

  const wifiData = data.substring(5, data.length - 2);
  const fields = wifiData.split(";");
  const wifiDetails: {
    ssid?: string;
    securityType?: string;
    password?: string;
    hidden?: boolean;
  } = {};

  fields.forEach((field) => {
    let [key, value] = field.split(":");
    if (value && value.endsWith("\\")) {
      value = value.slice(0, -1);
    }

    switch (key) {
      case "S":
        wifiDetails.ssid = value;
        break;
      case "T":
        wifiDetails.securityType = value;
        break;
      case "P":
        wifiDetails.password = value;
        break;
      case "H":
        wifiDetails.hidden = value === "true";
        break;
      default:
        break;
    }
  });

  return wifiDetails;
}
