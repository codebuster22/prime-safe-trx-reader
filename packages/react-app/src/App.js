import { useQuery } from "@apollo/react-hooks";
import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import { Body, Button, Header, Image, Link } from "./components";
import useWeb3Modal from "./hooks/useWeb3Modal";
import Requests from "./components/Requests";
import GET_TRANSFERS from "./graphql/subgraph";
import {getTransactions} from './SafeTransactionReader.js';

function WalletButton({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [account, setAccount] = useState("");
  const [rendered, setRendered] = useState("");

  useEffect(() => {
    async function fetchAccount() {
      try {
        if (!provider) {
          return;
        }

        // Load the user's accounts.
        const accounts = await provider.listAccounts();
        setAccount(accounts[0]);

        // Resolve the ENS name for the first account.
        const name = await provider.lookupAddress(accounts[0]);

        // Render either the ENS name or the shortened account address.
        if (name) {
          setRendered(name);
        } else {
          setRendered(account.substring(0, 6) + "..." + account.substring(36));
        }
      } catch (err) {
        setAccount("");
        setRendered("");
        console.error(err);
      }
    }
    fetchAccount();
  }, [account, provider, setAccount, setRendered]);

  return (
    <Button
      onClick={() => {
        if (!provider) {
          loadWeb3Modal();
        } else {
          logoutOfWeb3Modal();
        }
      }}
    >
      {rendered === "" && "Connect Wallet"}
      {rendered !== "" && rendered}
    </Button>
  );
}

function App() {
  const { loading } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [pendingRequests, setPendingRequests] = useState();
  const [completedRequests, setCompletedRequests] = useState();
  const [requests, setRequests] = useState();
  const [isLoaded, setLoaded] = useState();

  React.useEffect(() => {
    getTransactions(
      setPendingRequests,
      setCompletedRequests,
      setRequests,
      setLoaded
    );
  }, [loading]);

  return (
    <div>
      <Header>
        <WalletButton
          provider={provider}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
        />
      </Header>
      {isLoaded ? (
        <Body>
          <Requests requests={pendingRequests} title={"Pending Requests"} key={"PendingTransactions"}/>
          <Requests requests={completedRequests} title={"Completed Requests"} key={"CompletedTransactions"}/>
        </Body>
      ) : (
        <></>
      )}
    </div>
  );
}

export default App;
