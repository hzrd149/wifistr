import { createRxNostr, noopVerifier } from "rx-nostr";

const rxNostr = createRxNostr({ skipVerify: true, verifier: noopVerifier });

export default rxNostr;
