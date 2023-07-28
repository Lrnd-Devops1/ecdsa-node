import Wallet from "./Wallet";
import Transfer from "./Transfer";
import "./App.scss";
import { useState } from "react";

function App() {
  const [privateKey, setPrivateKey] = useState("");
  const [balance, setBalance] = useState(0);
  const [address, setAddress] = useState("");

  return (
    <div className="app">
      <Wallet
        privateKey={privateKey}
        setPrivateKey={setPrivateKey}
        balance={balance}
        setBalance={setBalance}
        address={address}
        setAddress={setAddress}
      />
      <Transfer setBalance={setBalance} balance={balance} privateKey={privateKey} />
    </div>
  );
}

export default App;
