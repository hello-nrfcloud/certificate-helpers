import { stat } from 'node:fs/promises'
import run from '@bifravst/run'
import { simulatorCALocations } from './locations.js'

export const createCA = async (
	destinationFolder: string,
	CN: string,
	email?: string,
): Promise<{
	privateKey: string
	certificate: string
}> => {
	// CA certificate
	const certificates = simulatorCALocations(destinationFolder)

	// Create a CA private key
	try {
		await stat(certificates.certificate)
	} catch {
		await run({
			command: 'openssl',
			args: ['genrsa', '-out', certificates.privateKey, '2048'],
		})
		let sub = `/C=NO/ST=Trondelag/L=Trondheim/O=Nordic Semiconductor ASA/OU=hello.nrfcloud.com/CN=${CN}`
		if (email !== undefined) sub = `${sub}/emailAddress=${email}`
		await run({
			command: 'openssl',
			args: [
				'req',
				'-x509',
				'-new',
				'-nodes',
				'-key',
				certificates.privateKey,
				'-sha256',
				'-days',
				'10957',
				'-out',
				certificates.certificate,
				'-subj',
				sub,
			],
		})
	}
	return certificates
}
