import { QuickStartClient } from "./quick-start/client";
import { HomeMarketing } from "@/components/home/home-marketing";

export default function HomePage() {
  return <QuickStartClient marketing={<HomeMarketing />} />;
}
