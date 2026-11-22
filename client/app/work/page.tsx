import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Selected Work | V4 Softronic",
  description: "Explore V4 Softronic projects across boutiques, watches, restaurants, clinics, real estate, salons and furniture.",
};

export default function WorkPage() {
  return <Home initialActive="work" />;
}
