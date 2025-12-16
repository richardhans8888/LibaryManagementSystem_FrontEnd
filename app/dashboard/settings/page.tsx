"use client";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";

type Profile = {
  first_name: string;
  last_name: string;
  address: string | null;
  phone_number: string | null;
  email: string | null;
};

export default function Page() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/member/profile");
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Failed to load profile");
        const p: Profile = data.profile;
        setProfile(p);
        setFirstName(p.first_name || "");
        setLastName(p.last_name || "");
        setAddress(p.address || "");
        setPhone(p.phone_number || "");
        setEmail(p.email || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (newPassword && !oldPassword) {
        throw new Error("Enter your current password to set a new one");
      }
      const res = await fetch("/api/member/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          address: address.trim() || null,
          phone_number: phone.trim() || null,
          email: email.trim() || null,
          password: newPassword || null,
          old_password: oldPassword || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update profile");
      setSuccess("Profile updated");
      setOldPassword("");
      setNewPassword("");
      setProfile((curr) =>
        curr
          ? {
              ...curr,
              first_name: firstName.trim(),
              last_name: lastName.trim(),
              address: address.trim() || null,
              phone_number: phone.trim() || null,
              email: email.trim() || null,
            }
          : curr
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Settings" subtitle="Update your personal information" />

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{error}</div> : null}
      {success ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{success}</div> : null}

      <form onSubmit={save} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-black/60 block mb-1">First Name</label>
            <input
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs text-black/60 block mb-1">Last Name</label>
            <input
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-black/60 block mb-1">Address</label>
          <input
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-black/60 block mb-1">Phone Number</label>
            <input
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs text-black/60 block mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-black/60 block mb-1">Current Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="text-xs text-black/60 block mb-1">New Password</label>
            <input
              type="password"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current password"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
