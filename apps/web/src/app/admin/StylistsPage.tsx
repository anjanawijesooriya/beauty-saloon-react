import { useState } from "react";
import { Star, ToggleLeft, ToggleRight, UserPlus, Trash2 } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useMinPending } from "@/hooks/useMinPending";
import {
  useAdminStylists,
  useToggleStylistAvailability,
  useCreateStylistProfile,
  useDeleteStylist,
} from "@/hooks/useStylists";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StylistProfile } from "@/types";

function PromoteModal({ onClose }: { onClose: () => void }) {
  const [userId, setUserId] = useState("");
  const { mutateAsync: create, isPending } = useCreateStylistProfile();
  const pending = useMinPending(isPending);
  const { data: users } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get("/users").then((r) => r.data),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    await create(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">
          Promote User to Stylist
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Select User
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2.5 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            >
              <option value="">Select a user…</option>
              {users?.users
                ?.filter((u: any) => u.role === "CUSTOMER")
                .map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
            </select>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!userId || pending}
              className="flex-1 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-60 transition-opacity"
            >
              {pending ? (
                <span className="flex items-center justify-center gap-2"><Spinner />Creating…</span>
              ) : "Create Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminStylistsPage() {
  const { data: stylists, isLoading } = useAdminStylists();
  const { mutate: toggle, isPending: toggling } = useToggleStylistAvailability();
  const { mutate: deleteStylist, isPending: deleting } = useDeleteStylist();
  const [showPromote, setShowPromote] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<StylistProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StylistProfile | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Stylists</h1>
          <p className="text-neutral-500 text-sm mt-0.5">
            {stylists?.length ?? "—"} registered stylists
          </p>
        </div>
        <button
          onClick={() => setShowPromote(true)}
          className="flex items-center gap-2 px-4 py-2.5 gradient-brand text-white rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <UserPlus size={16} /> Promote User
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">
                Stylist
              </th>
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">
                Specialties
              </th>
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">
                Rating
              </th>
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">
                Bookings
              </th>
              <th className="text-left px-5 py-3.5 font-medium text-neutral-500">
                Status
              </th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-neutral-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : stylists?.map((stylist) => (
                  <tr
                    key={stylist.id}
                    className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-brand flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {stylist.user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-900">
                            {stylist.user.name}
                          </p>
                          <p className="text-xs text-neutral-400">
                            {stylist.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {stylist.specialities.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="text-xs bg-brand-50 text-brand-600 px-2 py-0.5 rounded-pill"
                          >
                            {s}
                          </span>
                        ))}
                        {stylist.specialities.length > 2 && (
                          <span className="text-xs text-neutral-400">
                            +{stylist.specialities.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Star
                          size={13}
                          className="text-gold-400 fill-gold-400"
                        />
                        <span className="font-medium text-neutral-700">
                          {stylist.rating.toFixed(1)}
                        </span>
                        <span className="text-neutral-400 text-xs">
                          ({stylist.reviewCount})
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-600">
                      {(stylist as any)._count?.appointments ?? 0}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setToggleTarget(stylist)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                          stylist.isAvailable
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                        }`}
                      >
                        {stylist.isAvailable ? (
                          <ToggleRight size={14} />
                        ) : (
                          <ToggleLeft size={14} />
                        )}
                        {stylist.isAvailable ? "Available" : "Unavailable"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setDeleteTarget(stylist)}
                        title="Delete stylist account"
                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && !stylists?.length && (
          <div className="py-16 text-center text-neutral-400">
            <p className="font-display italic text-2xl mb-2">No stylists yet</p>
            <button
              onClick={() => setShowPromote(true)}
              className="text-brand-400 text-sm hover:underline"
            >
              Promote a user
            </button>
          </div>
        )}
      </div>

      {showPromote && <PromoteModal onClose={() => setShowPromote(false)} />}

      {toggleTarget && (
        <ConfirmModal
          variant="warning"
          title={
            toggleTarget.isAvailable
              ? "Set stylist as Unavailable?"
              : "Set stylist as Available?"
          }
          description={
            toggleTarget.isAvailable
              ? `${toggleTarget.user.name} will not appear for new bookings until re-enabled.`
              : `${toggleTarget.user.name} will be visible to customers and open for bookings.`
          }
          confirmLabel={
            toggleTarget.isAvailable
              ? "Yes, set unavailable"
              : "Yes, set available"
          }
          isPending={toggling}
          onConfirm={() =>
            toggle(toggleTarget.id, { onSuccess: () => setToggleTarget(null) })
          }
          onClose={() => setToggleTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          variant="danger"
          title={`Delete ${deleteTarget.user.name}'s account?`}
          description="This will permanently remove the stylist's profile, all their appointments, availability, and services. The user account will also be deleted. This cannot be undone."
          confirmLabel="Yes, delete permanently"
          isPending={deleting}
          onConfirm={() =>
            deleteStylist(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
          }
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
