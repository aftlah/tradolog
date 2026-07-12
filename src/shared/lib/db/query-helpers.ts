import { and, eq, isNull, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';

/** Soft-delete predicate for tables with deleted_at. */
export function notDeleted(deletedAtColumn: PgColumn): SQL {
	return isNull(deletedAtColumn);
}

export function ownedByUser(userIdColumn: PgColumn, userId: string): SQL {
	return eq(userIdColumn, userId);
}

export function activeOwnedByUser(
	userIdColumn: PgColumn,
	deletedAtColumn: PgColumn,
	userId: string,
): SQL {
	return and(ownedByUser(userIdColumn, userId), notDeleted(deletedAtColumn)) as SQL;
}

export type TableWithSoftDelete = PgTable & {
	id: PgColumn;
	deletedAt: PgColumn;
};
