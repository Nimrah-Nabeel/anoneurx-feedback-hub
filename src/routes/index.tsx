import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/lynx" });
  },
  head: () => ({
    meta: [
      { title: "Anoneurx Feedback" },
      { name: "description", content: "Share feedback on Anoneurx open source projects." },
      { property: "og:title", content: "Anoneurx Feedback" },
      { property: "og:description", content: "Share feedback on Anoneurx open source projects." },
    ],
  }),
});
