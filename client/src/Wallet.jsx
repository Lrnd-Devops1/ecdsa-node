import * as secp from 'ethereum-cryptography/secp256k1';

import { toHex } from 'ethereum-cryptography/utils';
import server from "./server";

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    
   // const balanceBytes = utf8ToBytes(balance);
    //const balanceHash = keccak256(balanceBytes);
    //const signedMessage = await secp.secp256k1.sign(balanceHash, privateKey, { recovered: true });
    const privateKey = evt.target.value;
    const address = toHex(secp.secp256k1.getPublicKey(privateKey));
    setPrivateKey(privateKey);

    
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type a private key, for example: 0x1" value={privateKey} onChange={onChange}></input>
      </label>
      <label>
        Address: {address.slice(0,20)} ...
      </label>
      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
