const ACCOUNT_SWITCH_EVENT = 'tradolog:account-switch';
const ACCOUNT_SWITCH_ACK_EVENT = 'tradolog:account-switch-ack';

export interface AccountSwitchDetail {
	accountId: string;
}

/**
 * Ask the active feature shell to refetch for `accountId` without a full page reload.
 * Returns true when a listener acknowledged within the timeout.
 */
export function requestClientAccountSwitch(accountId: string, timeoutMs = 150): Promise<boolean> {
	return new Promise((resolve) => {
		let settled = false;

		function finish(handled: boolean) {
			if (settled) {
				return;
			}
			settled = true;
			window.clearTimeout(timer);
			window.removeEventListener(ACCOUNT_SWITCH_ACK_EVENT, onAck);
			resolve(handled);
		}

		function onAck() {
			finish(true);
		}

		const timer = window.setTimeout(() => finish(false), timeoutMs);
		window.addEventListener(ACCOUNT_SWITCH_ACK_EVENT, onAck, { once: true });
		window.dispatchEvent(
			new CustomEvent<AccountSwitchDetail>(ACCOUNT_SWITCH_EVENT, {
				detail: { accountId },
			}),
		);
	});
}

/** Feature shells call this to handle navbar account switches in-place. */
export function subscribeClientAccountSwitch(
	handler: (accountId: string) => void | Promise<void>,
): () => void {
	function onSwitch(event: Event) {
		const detail = (event as CustomEvent<AccountSwitchDetail>).detail;
		if (!detail?.accountId) {
			return;
		}
		window.dispatchEvent(new Event(ACCOUNT_SWITCH_ACK_EVENT));
		void handler(detail.accountId);
	}

	window.addEventListener(ACCOUNT_SWITCH_EVENT, onSwitch);
	return () => window.removeEventListener(ACCOUNT_SWITCH_EVENT, onSwitch);
}
