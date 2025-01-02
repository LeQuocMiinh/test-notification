async function createJwtForApns(privateKey: string, keyId: string, teamId: string) {
    const header = { alg: "ES256", kid: keyId };
    const claims = {
        iss: teamId,
        iat: Math.floor(Date.now() / 1000),
    };

    const encoder = new TextEncoder();
    const headerBase64 = btoa(JSON.stringify(header));
    const claimsBase64 = btoa(JSON.stringify(claims));
    const unsignedToken = `${headerBase64}.${claimsBase64}`;

    const key = await crypto.subtle.importKey(
        "pkcs8",
        pemToArrayBufferForApns(privateKey),
        { name: "ECDSA", namedCurve: "P-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        { name: "ECDSA", hash: { name: "SHA-256" } },
        key,
        encoder.encode(unsignedToken)
    );

    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    return `${unsignedToken}.${signatureBase64}`;
}

function pemToArrayBufferForApns(pem: string) {
    const base64 = pem.replace(/-----.*?-----/g, "").replace(/\s/g, "");
    const binary = atob(base64);
    const arrayBuffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        arrayBuffer[i] = binary.charCodeAt(i);
    }
    return arrayBuffer.buffer;
}


export { createJwtForApns }

