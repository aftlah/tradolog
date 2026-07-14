import { useMemo, useState } from 'react';
import { Check, Copy, Eye, Loader2, LogOut, Settings2, UserCheck, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge, Button } from '@shared/components';
import { SETTINGS_PAGE_ROUTE } from '@features/settings/constants/settings.constants';
import { SHARING_API_ROUTE, SHARING_PAGE_ROUTE } from '../constants/sharing.constants';
import type { JournalShareDto, SharedJournalViewDto, SharingPageData } from '../types/sharing.types';
import { SharedJournalPanel } from './SharedJournalPanel';

interface SharedShellProps {
	initialData: SharingPageData;
	initialView: SharedJournalViewDto | null;
	acceptToken: string | null;
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

/** Mentor hub — accept invites and open read-only trainee journals. */
export function SharedShell({ initialData, initialView, acceptToken }: SharedShellProps) {
	const [incoming, setIncoming] = useState(initialData.incoming);
	const [outgoing] = useState(initialData.outgoing);
	const [view, setView] = useState<SharedJournalViewDto | null>(initialView);
	const [acceptingId, setAcceptingId] = useState<string | null>(null);
	const [leavingId, setLeavingId] = useState<string | null>(null);
	const [loadingViewId, setLoadingViewId] = useState<string | null>(null);

	const pending = useMemo(() => incoming.filter((share) => share.status === 'pending'), [incoming]);
	const active = useMemo(() => incoming.filter((share) => share.status === 'active'), [incoming]);
	const liveOutgoing = useMemo(
		() => outgoing.filter((share) => share.status === 'pending' || share.status === 'active'),
		[outgoing],
	);
	const isEmptyMentorInbox = pending.length === 0 && active.length === 0;

	async function accept(share: JournalShareDto, token?: string | null) {
		setAcceptingId(share.id);
		try {
			const response = await fetch(`${SHARING_API_ROUTE}/accept`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(token ? { token } : { id: share.id }),
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not accept invite.');
			}
			const updated = (await response.json()) as JournalShareDto;
			setIncoming((current) => current.map((row) => (row.id === updated.id ? updated : row)));
			toast.success('Invite accepted. You can open their journal.');
			await openView(updated.id);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not accept invite.');
		} finally {
			setAcceptingId(null);
		}
	}

	async function openView(shareId: string, accountId?: string | null) {
		setLoadingViewId(shareId);
		try {
			const url = new URL(`${SHARING_API_ROUTE}/${shareId}`, window.location.origin);
			if (accountId) {
				url.searchParams.set('accountId', accountId);
			}
			const response = await fetch(url.pathname + url.search, { credentials: 'same-origin' });
			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not load shared journal.');
			}
			const next = (await response.json()) as SharedJournalViewDto;
			setView(next);
			const pageUrl = new URL(SHARING_PAGE_ROUTE, window.location.origin);
			pageUrl.searchParams.set('shareId', shareId);
			if (next.activeAccountId) {
				pageUrl.searchParams.set('accountId', next.activeAccountId);
			}
			window.history.replaceState({}, '', `${pageUrl.pathname}${pageUrl.search}`);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not load shared journal.');
		} finally {
			setLoadingViewId(null);
		}
	}

	async function leave(shareId: string) {
		setLeavingId(shareId);
		try {
			const response = await fetch(`${SHARING_API_ROUTE}/${shareId}?as=mentor`, {
				method: 'DELETE',
				credentials: 'same-origin',
			});
			if (!response.ok) {
				const payload = await response.json().catch(() => null);
				throw new Error(payload?.error ?? 'Could not leave share.');
			}
			setIncoming((current) => current.filter((row) => row.id !== shareId));
			if (view?.share.id === shareId) {
				setView(null);
			}
			toast.success('Left shared journal.');
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Could not leave share.');
		} finally {
			setLeavingId(null);
		}
	}

	async function copyLink(share: JournalShareDto) {
		try {
			await navigator.clipboard.writeText(share.inviteUrl);
			toast.success('Invite link copied.');
		} catch {
			toast.message(share.inviteUrl);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight text-foreground">Shared Journals</h1>
					<p className="mt-1 text-sm text-muted">
						Inbox mentor — jurnal yang dibagikan ke kamu (read-only). Invite mentor lewat Settings.
					</p>
				</div>
				<a
					href={`${SETTINGS_PAGE_ROUTE}?tab=sharing`}
					className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-indigo-400 to-indigo-600 px-5 text-sm font-medium text-primary-foreground shadow-[0_8px_28px_rgb(99_102_241_/_0.28)] transition-all duration-200 hover:from-indigo-300 hover:to-indigo-600"
				>
					<UserPlus className="size-4" aria-hidden="true" />
					Invite Mentor
				</a>
			</div>

			{acceptToken && pending.length > 0 ? (
				<div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-foreground" role="status">
					You opened an invite link. Accept it below to unlock the journal.
				</div>
			) : null}

			{isEmptyMentorInbox ? (
				<div className="glass-card space-y-4 p-6">
					<p className="text-sm text-foreground">
						Halaman ini menampilkan jurnal orang lain yang mengundang kamu sebagai mentor. Belum ada invite ke email akun
						ini.
					</p>
					<p className="text-sm text-muted">
						Kalau kamu yang mau undang mentor: buka{' '}
						<a href={`${SETTINGS_PAGE_ROUTE}?tab=sharing`} className="text-primary underline-offset-4 hover:underline">
							Settings → Sharing
						</a>
						, lalu kirim email + bagikan link invite.
					</p>
					{liveOutgoing.length > 0 ? (
						<div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
							<p className="text-xs font-medium tracking-wide text-muted uppercase">Your outgoing invites</p>
							<ul className="mt-3 space-y-2">
								{liveOutgoing.map((share) => (
									<li key={share.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
										<span className="text-foreground">{share.mentorEmail}</span>
										<div className="flex items-center gap-2">
											{statusBadge(share.status)}
											{share.status === 'pending' ? (
												<Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={() => void copyLink(share)}>
													<Copy className="size-3.5" />
													Copy link
												</Button>
											) : null}
										</div>
									</li>
								))}
							</ul>
						</div>
					) : (
						<a
							href={`${SETTINGS_PAGE_ROUTE}?tab=sharing`}
							className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
						>
							<Settings2 className="size-4" aria-hidden="true" />
							Kelola invite di Settings → Sharing
						</a>
					)}
				</div>
			) : null}

			<div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
				<section className="glass-card space-y-5 p-5">
					<div>
						<h2 className="text-sm font-medium text-muted">Pending invites</h2>
						{pending.length === 0 ? (
							<p className="mt-3 text-sm text-muted">No pending invites for your email.</p>
						) : (
							<ul className="mt-3 space-y-3">
								{pending.map((share) => (
									<li key={share.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
										<p className="font-medium text-foreground">{share.ownerName ?? share.ownerEmail ?? 'Trader'}</p>
										<p className="text-xs text-muted">{share.ownerEmail}</p>
										{share.message ? <p className="mt-2 text-xs text-muted">{share.message}</p> : null}
										<Button
											type="button"
											size="sm"
											className="mt-3 w-full gap-1.5"
											disabled={acceptingId === share.id}
											onClick={() => void accept(share, acceptToken && share.inviteToken === acceptToken ? acceptToken : null)}
										>
											{acceptingId === share.id ? <Loader2 className="size-3.5 animate-spin" /> : <UserCheck className="size-3.5" />}
											Accept invite
										</Button>
									</li>
								))}
							</ul>
						)}
					</div>

					<div>
						<h2 className="text-sm font-medium text-muted">Active access</h2>
						{active.length === 0 ? (
							<p className="mt-3 text-sm text-muted">No active shared journals yet.</p>
						) : (
							<ul className="mt-3 space-y-3">
								{active.map((share) => {
									const isOpen = view?.share.id === share.id;
									return (
										<li key={share.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
											<div className="flex items-start justify-between gap-2">
												<div>
													<p className="font-medium text-foreground">{share.ownerName ?? 'Trader'}</p>
													<p className="text-xs text-muted">{share.ownerEmail}</p>
												</div>
												{isOpen ? <Badge variant="success">Viewing</Badge> : null}
											</div>
											<div className="mt-3 flex gap-2">
												<Button
													type="button"
													size="sm"
													variant={isOpen ? 'secondary' : 'outline'}
													className="flex-1 gap-1.5"
													disabled={loadingViewId === share.id}
													onClick={() => void openView(share.id)}
												>
													{loadingViewId === share.id ? (
														<Loader2 className="size-3.5 animate-spin" />
													) : isOpen ? (
														<Check className="size-3.5" />
													) : (
														<Eye className="size-3.5" />
													)}
													{isOpen ? 'Open' : 'View'}
												</Button>
												<Button
													type="button"
													size="sm"
													variant="outline"
													className="gap-1.5 text-danger"
													disabled={leavingId === share.id}
													onClick={() => void leave(share.id)}
													aria-label="Leave shared journal"
												>
													{leavingId === share.id ? <Loader2 className="size-3.5 animate-spin" /> : <LogOut className="size-3.5" />}
												</Button>
											</div>
										</li>
									);
								})}
							</ul>
						)}
					</div>
				</section>

				<section>
					{view ? (
						<SharedJournalPanel
							view={view}
							onAccountChange={(accountId) => void openView(view.share.id, accountId)}
						/>
					) : (
						<div className="glass-card flex min-h-80 items-center justify-center p-8 text-center">
							<p className="max-w-sm text-sm text-muted">
								Accept an invite or select an active shared journal to review performance and recent trades.
							</p>
						</div>
					)}
				</section>
			</div>
		</div>
	);
}
