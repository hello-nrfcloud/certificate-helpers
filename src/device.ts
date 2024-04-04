import run from '@bifravst/run'
import { deviceCertificateLocations } from './locations.js'

export const signDeviceCertificate = async ({
	dir,
	deviceId,
	caCertificateLocation,
	caPrivateKeyLocation,
}: {
	dir: string
	deviceId: string
	caCertificateLocation: string
	caPrivateKeyLocation: string
}): Promise<void> => {
	const { CSR: deviceCSRLocation, signedCert: deviceSignedCertLocation } =
		deviceCertificateLocations(dir, deviceId)

	await run({
		command: 'openssl',
		args: [
			'x509',
			'-req',
			'-CA',
			caCertificateLocation,
			'-CAkey',
			caPrivateKeyLocation,
			'-in',
			deviceCSRLocation,
			'-out',
			deviceSignedCertLocation,
			'-days',
			'10957',
		],
	})
}

export const createDeviceCertificate = async ({
	dest,
	caCertificates,
	deviceId,
}: {
	dest: string
	caCertificates: {
		privateKey: string
		certificate: string
	}
	deviceId: string
}): Promise<{
	privateKey: string
	certificate: string
	CSR: string
	signedCert: string
}> => {
	const deviceCertificates = deviceCertificateLocations(dest, deviceId)

	// Device private key
	await run({
		command: 'openssl',
		args: [
			'ecparam',
			'-out',
			deviceCertificates.privateKey,
			'-name',
			'prime256v1',
			'-genkey',
		],
	})

	// Device certificate
	await run({
		command: 'openssl',
		args: [
			'req',
			'-x509',
			'-new',
			'-nodes',
			'-key',
			deviceCertificates.privateKey,
			'-sha256',
			'-days',
			'10957',
			'-out',
			deviceCertificates.certificate,
			'-subj',
			`/CN=${deviceId}`,
		],
	})

	// Create CSR
	await run({
		command: 'openssl',
		args: [
			'req',
			'-key',
			deviceCertificates.privateKey,
			'-new',
			'-out',
			deviceCertificates.CSR,
			'-subj',
			`/CN=${deviceId}`,
		],
	})

	// Sign device cert
	await signDeviceCertificate({
		dir: dest,
		deviceId,
		caCertificateLocation: caCertificates.certificate,
		caPrivateKeyLocation: caCertificates.privateKey,
	})

	return deviceCertificates
}
