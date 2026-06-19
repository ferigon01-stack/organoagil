"use client";

import { useParams } from "next/navigation";
import TransportadoraForm from "@/components/TransportadoraForm";

export default function EditarTransportadoraPage() {
  const params = useParams();
  const id = params.id as string;
  return <TransportadoraForm id={id} />;
}
