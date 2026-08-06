"use client";
import { useState } from "react";
import { User } from "lucide-react";
import { AboutMeEditor } from "./AboutMeEditor";

export function AboutMeCard({ bio }: { bio: string }) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-3">
        <User className="h-4 w-4 text-zinc-500" />
        <h3 className="font-bold text-zinc-900 text-sm">About Me</h3>
      </div>
      {editing ? (
        <AboutMeEditor initialBio={bio} onDone={() => setEditing(false)} />
      ) : (
        <>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {bio || "You haven't written a bio yet. Tell employers a bit about yourself."}
          </p>
          <button onClick={() => setEditing(true)} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">Edit About Me</button>
        </>
      )}
    </div>
  );
}
