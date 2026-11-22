import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Services | V4 Softronic",
  description: "UI/UX, web development, e-commerce, brand systems and conversion strategy.",
};

export default function ServicesPage() {
  return <Home initialActive="services" />;
}
