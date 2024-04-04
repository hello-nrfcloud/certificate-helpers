import run from '@bifravst/run'

export const inspectCert = async (location: string): Promise<string> =>
	run({
		command: 'openssl',
		args: ['x509', '-text', '-noout', '-in', location],
	})

export const inspectString = async (cert: string): Promise<string> =>
	run({
		command: 'openssl',
		args: ['x509', '-text', '-noout'],
		input: cert,
	})
