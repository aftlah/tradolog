import 'dotenv/config';
import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) {
	console.error('FAIL missing DATABASE_URL');
	process.exit(1);
}

console.log('Trying:', url.replace(/:([^:@/]*)@/, ':***@'));

const sql = postgres(url, { connect_timeout: 8, max: 1 });

try {
	const rows = await sql`select current_database() as db, current_user as usr`;
	console.log('OK', rows[0]);
	await sql.end();
	process.exit(0);
} catch (error) {
	console.error('FAIL', error?.code ?? '', error?.message ?? String(error));
	try {
		await sql.end({ timeout: 1 });
	} catch {
		/* ignore */
	}
	process.exit(1);
}
