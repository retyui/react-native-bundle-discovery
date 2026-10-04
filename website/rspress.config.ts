import { withCallstackPreset } from "@callstack/rspress-preset";

export default () =>
  withCallstackPreset(
    {
      context: import.meta.dirname,
      docs: {
        title: "React Native Bundle Discovery",
        description:
          "Visualize and analyze the JS bundle of your React Native app",
        editUrl:
          "https://github.com/retyui/react-native-bundle-discovery/tree/main/website",
        icon: "/img/logo.svg",
        logoLight: "/img/logo.svg",
        logoDark: "/img/logo.svg",
        ogImage: "/img/ui.png",
        rootDir: "docs",
        rootUrl: "https://retyui.github.io/bundle-discovery/",
        socials: {
          github: "https://github.com/retyui/react-native-bundle-discovery",
        },
      },
    },
    {
      base: "/bundle-discovery/",
    },
  );
