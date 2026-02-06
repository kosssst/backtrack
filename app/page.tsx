"use client"
import {authClient} from "@/lib/auth-client";
import {redirect} from "next/navigation";

export default function Home() {
	const { data: session, isPending } = authClient.useSession();
	if (isPending) return <h1>Loading...</h1>;
	if (!session) redirect("/login");

  return (
    <h1>Welcome {session.user.name}</h1>
  );
}
