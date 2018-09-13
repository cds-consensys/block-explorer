# Block-explorer

This block explorer is a command line tool to display ad-hoc blockchain data
over a given range of blocks. In that range it will answer basic account
questions:

1. How much ether was transferred
2. Which addresses received ether and total did they received
3. Which addresses sent ether and the total they sent
4. A list of contract addresses that participated transactions
5. Pct of Ether sent grouped by account type
6. Pct of Ether received transactions grouped by account type
7. How many contracts were created

# Challenges
 - All transfers are initiated by an externally owned account, ie one with
   a private key. However Ether can be transferred from Smart contracts as well.
   Those smart contract sends are not captured in the transaction, or transaction records,
   exposed by Web3. They can be calculated by executing the smart contract code,
   with the inputs in the transaction against the current state of the Ethereum
   Machine. As of now, I haven't figured out how to solve this technical
   problem; it's a research and work in progress.

 - Identifying different behavior between the implemention of the different networks.
     Should a comparison engine be used for each network?  For example ganache*
     vs (mainnet and rinkeby) differ in the value One in the implementation of
     `getTransaction()`. The `status` attribute is:
       - '0x01' on ganache
       - '0x1' on  mainnet and rinkeby

 - My lack of knowledge of current best practices and work flow in this space.
   This as an opportunity to investigate the developer flow as well as
   developing the simple blockchain explorer.

 - Unknown network compatibility issues. Are blocks and transactions structured
   and encoded identically? Something to keep in mind

# Demo

View the demo below. You can use the player scrubber to fast forward; no one
should be held hostage waiting for web requests to complete. A fun fact about
asciinema casts is you can cut and paste text from the player!

[![asciicast](https://asciinema.org/a/500jnrDaC9e4lsLpPP5ihAZFh.png)](https://asciinema.org/a/500jnrDaC9e4lsLpPP5ihAZFh)

# Tools

This project was build using node 9.11.2 and includes an .nvmrc if you happen
to use nvm.

# Build
Clone the repo and build
 ```sh
 $ git clone https://github.com/cds-consensys/block-explorer
 $ cd block-explorer
 $ nvm use
 $ npm install
 ```

# Installation

Link the project to get access to the commandline interface. Linking will not be
the future when this project is published.

__This must be
done from the root folder of the project where `package.json` resides.__
```sh
$ npm link
```

# Environment variables

Infura endpoints should be configured as part of the environment. Get an
endpoint by visiting https://infura.io/

```sh
export BKX_RINKEBY="https://rinkeby.infura.io/v3/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export BKX_MAINNET="https://mainnet.infura.io/v3/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

Tip: put the two exports in a file `secrets.env` and `source` it to get the
export in the environment.

```sh
$ source ./secrets.env
```

# Testing

## Mocha tests

Some tests require mainnet or rinkeby access.

__Don't forget to source your secrets.env file to [set Infura endpoints](#environment-variables)!__

```sh
$ npm test

> block-explorer@1.0.0 test /Volumes/Sofai/dev/consensys/interview/trufflesuite/block-explorer
> mocha --reporter spec './src/*.test.js'

  explorer
    rinkeby tests verify range [2971555, 2971556]
      ✓ calculates the total transferred ETH
      ✓ counts the number of contracts created
      for Externally Owned Accounts
        ✓ calculates the total ETH received
        ✓ calculates the total ETH sent
      for Contract Accounts
        ✓ calculates the total ETH received
        ✓ calculates the total ETH sent


  6 passing (690ms)
```

## Truffle tests
The tests leverage `truffle develop's` test blockchain. Run them by
going into the `tests` folder and enter the `trufle develop console` and
invoking `test`

```sh
$ cd solidity
$ truffle develop

truffle(develop)> test
Compiling ./contracts/ExploreTest.sol...
Compiling ./contracts/Migrations.sol...


  Contract: ExploreTest
    ✓ should get a database object from explorer (118ms)

  1 passing (136ms)

truffle(develop)>
```


# Program help

This project utilizes [neodoc](https://felixschl.github.io/neodoc/#/?_k=jq4bnh),
a node implementation of [DOCOPT](http://docopt.org) allowing you make beautiful
commands adhering to POSIX conventions that have been used for decades in help
messages and man pages for describing a program's interface.

```sh

$ bkx -h

Blockchain explorer tool to study ETH velocity.
https://goo.gl/r7w991

Usage:
  bkx STARTBLOCK ENDBLOCK --net=NETWORK [--logblocks --logcontracts --logtrans --logreceipts]
  bkx FROMCURRENTBLOCK --net=NETWORK [--logblocks --logcontracts --logtrans --logreceipts]

Options:
  -h --help         Show help
  -v --version      Show version
  --net=NETWORK     The network to use. (mainnet, rinkeby, local) [default: local]
  --logblocks       Log blocks
  --logcontracts    Log created contracts
  --logtrans        Log summary of each processed transaction
  --logreceipts     Log Transaction receipts
```

## Examples

__Don't forget to source your secrets.env file to [set Infura endpoints](#environment-variables)!__

1. Explore rinkeby starting 10 blocks from `latest`
   ```sh
   $ bkx 10 --net rinkeby
   ```

2. Explore rinkeby starting 10 blocks from `latest` and log transactions
   ```sh
   $ bkx 10 --net rinkeby --logtrans
   ```

3. Explore rinkeby block range [2964759, 2964769]
   ```sh
   $ bkx 2964759 2964769 --net rinkeby
   ```
