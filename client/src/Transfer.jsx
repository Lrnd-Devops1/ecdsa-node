import { useState } from "react";
import * as secp  from 'ethereum-cryptography/secp256k1';
import { keccak256 } from "ethereum-cryptography/keccak"
import { utf8ToBytes } from 'ethereum-cryptography/utils';
import server from "./server";

function Transfer({ balance, setBalance, privateKey}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const amountBytes = utf8ToBytes(`"${sendAmount}"`);
  const amountHash = keccak256(amountBytes);
  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const signature = await secp.secp256k1.sign(amountHash, privateKey, { recovery: true});
    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        amount: parseInt(sendAmount),
        //serialize the signature object
        signature: JSON.stringify(signature, (key, value) =>
        typeof value === "bigint" ? value.toString() + "n" : value
      ),
        recipient,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
