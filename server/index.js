const secp = require("ethereum-cryptography/secp256k1");
const keccak = require("ethereum-cryptography/keccak");
const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "03716286ddcfa94a6691d886c8d953d2debb138e242b1828e3eb1329a5c57e8b74": 100, // privatekey: "ac0ea2b8063e4567448b907386d867c0a97d1094869291eaef11ed23aae90ee5" 
  "032e18f32750c9a8a5a74ea9cfa1cb0441dc313dc22823234b53f2cdeb230ec127": 50, // privatekey: "b50c48074a752daeaaa3ea3699455796003e6fb969b4b2246fd300c3281bf4e9"
  "02d367abd27df8ff72293ba9948a72f8ddb72b57ce5eacc00a11b0d7e745a0e466": 75, //privatekey: "f40785ccbe538e5943cd1a092ba119daff788cffae390966e3ec956677aace59"
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { recipient, amount, signature } = req.body;

  // deserialize the signature objec
  const sigObj = JSON.parse(signature, (key, value) => {
    if (typeof value === "string" && /^\d+n$/.test(value)) {
      return BigInt(value.substring(0, value.length - 1));
    }
    return value;
  });
  const amountBytes = utf8ToBytes(`"${amount}"`);
  const amountHash = keccak.keccak256(amountBytes);
  var senderKey = new secp.secp256k1.Signature(sigObj.r, sigObj.s, sigObj.recovery).recoverPublicKey(amountHash);
  var sender = toHex(senderKey.toRawBytes())

  setInitialBalance(sender);
  setInitialBalance(recipient);
  if (sender.toString() === recipient.toString()) {
    res.status(400).send({ message: "Sender and recipient cannot be same" });
  }
  else if (balances[sender] < amount) {
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
