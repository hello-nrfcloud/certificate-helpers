import run from '@bifravst/run'

export const toPEM = async (
	derLocation: string,
	pemLocation: string,
): Promise<void> => {
	await run({
		command: 'openssl',
		args: ['req', '-inform', 'DER', '-in', derLocation, '-out', pemLocation],
	})
}
