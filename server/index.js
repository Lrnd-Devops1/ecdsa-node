const secp = require("ethereum-cryptography/secp256k1");

const { keccak256 } = require("ethereum-cryptography/keccak");
const { bytesToHex, toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03a307781e810fb2302cb14aa768a0fc879b68a6e8597538257d64beee56373602": 100, // privatekey: "134af9b1ec10bdbbd084ab45e78c35c7667e137f0abefb77f27abad1aec3ab89" 
  "03c7157a4ca98113193b980d19e22c4e2b2fb84e4bad8823f0b6a6aba8dd0d2626": 50, // privatekey: "c9dd51112aaaa76173017c753843f9adc6aa04f781b7a0f5bea134dc32f94fc5"
  "023b4c08f745140e1f044fe9b028a33cdee38d46dc58f9aa93b4e114966db4ba1d": 75, //privatekey: "d6b3c542d0141f1b5c9363249d31993734f673fb6e283025ef013bdd0e3e3268"
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { recipient, amount, signature } = req.body;

  // deserialize the signature object
  const sigObj = JSON.parse(signature, (key, value) => {
    if (typeof value === "string" && /^\d+n$/.test(value)) {
      return BigInt(value.substring(0, value.length - 1));
    }
    return value;
  });
  const amountBytes = utf8ToBytes(`"${amount}"`);
  var senderKey = new secp.secp256k1.Signature(sigObj.r, sigObj.s, sigObj.recovery).recoverPublicKey(amountBytes);
  var sender = toHex(senderKey.toRawBytes())

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
