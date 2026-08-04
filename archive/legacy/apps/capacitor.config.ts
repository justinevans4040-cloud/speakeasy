import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.wakeforged.speakeasy",
  appName: "SpeakEasy",
  webDir: "www",
  server: {
    // Remote-first wrapper. This will load the live site.
    url: "https://www.wakeforged.com/speakeasy/",
    cleartext: false
  }
};

export default config;
