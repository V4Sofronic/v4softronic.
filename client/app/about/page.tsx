import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "About | V4 Softronic",
  description: "Meet the strategy, design, development and quality disciplines behind V4 Softronic.",
};

export default function AboutPage() {
  return <Home initialActive="about" />;
}
