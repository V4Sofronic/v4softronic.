import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Process | V4 Softronic",
  description: "A clear six-step process from discovery and flows to launch.",
};

export default function ProcessPage() {
  return <Home initialActive="process" />;
}
