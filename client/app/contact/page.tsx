import type { Metadata } from "next";
import Home from "../page";

export const metadata: Metadata = {
  title: "Contact | V4 Softronic",
  description: "Start a project with V4 Softronic.",
};

export default function ContactPage() {
  return <Home initialActive="contact" />;
}
