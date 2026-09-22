import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getUserId } from "@/lib/auth";
import { ProfileForm } from "@/components/auth/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      emergencyContact: true,
      healthNotes: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ProfileForm
      initial={{
        name: user.name,
        email: user.email,
        phone: user.phone,
        emergencyContact: user.emergencyContact || "",
        healthNotes: user.healthNotes || "",
      }}
    />
  );
}
