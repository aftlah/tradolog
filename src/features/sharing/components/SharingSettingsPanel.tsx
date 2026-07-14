import { useState } from 'react';
import { Check, Copy, Link2, Loader2, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button } from '@shared/components';
import { SETTINGS_SHARING_HINT, SHARING_API_ROUTE } from '../constants/sharing.constants';
import { inviteUrlFromToken } from '../utils/invite-url';
import type { JournalShareDto } from '../types/sharing.types';
import { SharingInviteForm } from './SharingInviteForm';

interface SharingSettingsPanelProps {
	initialOutgoing: JournalShareDto[];
}

function statusBadge(status: JournalShareDto['status']) {
	if (status === 'active') {
		return <Badge variant="success">Active</Badge>;
	}
	if (status === 'pending') {
		return <Badge variant="warning">Pending</Badge>;
	}
	return <Badge variant="muted">Revoked</Badge>;
}

/** Settings → Sharing: invite mentors and manage outgoing grants. */
export function SharingSettingsPanel({ initialOutgoing }: SharingSettingsPanelProps) {
	const [outgoing, setOutgoing] = useState(initialOutgoing);
	const [revokingId, setRevokingId] = useState<string | null>(null);

	async function copyLink(share: JournalShareDto) {
		const link = inviteUrlFromToken(share.inviteToken);
		try {
			await navigator.clipboard.writeText(link);
			toast.success('Invite link copied.');
		} catch {
			toast.message(link);
		}
	}

	async function revoke(shareId: string) {
		setRevokingId(shareId);
		try {
			const response = await fetch(`${SHARING_API_ROUTE}/${shareId}`, {
				method: 'DELETE',
				credentials: 'same-origin',
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not revoke access.');
			}
			setOutgoing((current) =>
				current.map((share) =>
					share.id === shareId
						? { ...share, status: 'revoked', revokedAt: new Date().toISOString() }
						: share,
				),
			);
			toast.success('Mentor access revoked.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not revoke access.');
		} finally {
			setRevokingId(null);
		}
	}

	return (
		<div className="space-y-6">
			<div className="glass-card space-y-6 p-6">
				<div className="flex items-start gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
						<Shield className="size-5" aria-hidden="true" />
					</div>
					<div>
						<h2 className="text-sm font-medium text-muted">Mentor Mode</h2>
						<p className="mt-1 text-xs text-muted">{SETTINGS_SHARING_HINT}</p>
					</div>
				</div>
				<SharingInviteForm onInvited={(share) => setOutgoing((current) => [share, ...current])} />
			</div>

			<div className="glass-card space-y-4 p-6">
				<h3 className="text-sm font-medium text-foreground">Outgoing invites</h3>
				{outgoing.length === 0 ? (
					<p className="py-6 text-center text-sm text-muted">No mentors invited yet.</p>
				) : (
					<ul className="space-y-3">
						{outgoing.map((share) => (
							<li
								key={share.id}
								className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-2">
										<p className="truncate font-medium text-foreground">{share.mentorEmail}</p>
										{statusBadge(share.status)}
									</div>
									{share.message ? <p className="mt-1 text-xs text-muted">{share.message}</p> : null}
								</div>
								<div className="flex shrink-0 items-center gap-2">
									{share.status !== 'revoked' ? (
										<Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => void copyLink(share)}>
											{share.status === 'pending' ? <Link2 className="size-3.5" /> : <Copy className="size-3.5" />}
											Copy link
										</Button>
									) : null}
									{share.status !== 'revoked' ? (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="gap-1.5 text-danger"
											disabled={revokingId === share.id}
											onClick={() => void revoke(share.id)}
										>
											{revokingId === share.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
											Revoke
										</Button>
									) : (
										<span className="inline-flex items-center gap-1 text-xs text-muted">
											<Check className="size-3.5" /> Revoked
										</span>
									)}
								</div>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
