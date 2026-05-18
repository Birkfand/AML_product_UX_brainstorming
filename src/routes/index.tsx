import { createFileRoute } from "@tanstack/react-router";
import AmlFlow from "@/components/aml/AmlFlow";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "AML Compliance Flow — Live Operations Demo" },
      { name: "description", content: "Interactive AML compliance data flow visualisation for banks: onboarding, KYC, CRR, transaction monitoring, case management and AI overlay." },
      { property: "og:title", content: "AML Compliance Flow — Live Operations Demo" },
      { property: "og:description", content: "Interactive enterprise AML pipeline visualisation." },
    ],
  }),
});

function Index() {
  return <AmlFlow />;
}
