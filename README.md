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
7. How many contracts were created (seems to work on ganache networks, but not
   mainnet nor rinkeby. Haven't tested the other testnets)

# Demo
An asciinema screencast is available here: https://asciinema.org/a/iW92M7R2NAlaKAdBL7cASS0vg

## Concerns & missed goals.
 - Transfers from contracts to another address are initiated by an Externally
     Owned Account and I'm not sure how to access the subsequent(embedded?)
     transfers that may be initiated just from web3's api.

 - Different behavior between ganache* vs mainnet and rinkeby for detecting when
     a contract is created. According to
     https://ethereum.stackexchange.com/a/29703/30050 Contract creation is
     detected when the transaction's `to` field is null, however on ganache, the
     `to` field is '0x0'. The implication is there could be other differences
     depending on network and should be considered when processing.

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

The tests leverage `truffle develop's` test blockchain. Run them by
going into the `tests` folder and enter the `trufle develop console` and
invoking `test`

```sh
$ cd tests
$ truffle develop

truffle(develop)> test
Compiling ./contracts/ExploreTest.sol...
Compiling ./contracts/Migrations.sol...


  Contract: ExploreTest
    ✓ should get a database object from explorer (118ms)

  1 passing (136ms)

truffle(develop)>
```


## Thoughts

I'm still researching best practices and took this as an opportunity to
investigate the developer flow as much as developing the simple blockchain
explorer. The only guide I have is to structure the explorer as an API that both
the command line interface and the test client utilize.

__Unknowns__
 - Compatibilities in the different networks. Are blocks and transactions
   structured and encoded identically?

# Program help

This project utilizes [neodoc](https://felixschl.github.io/neodoc/#/?_k=jq4bnh),
a node implementation of [DOCOPT](http://docopt.org) allowing you make beautiful
commanline interfaces adhering to POSIX conventions that have been used for
decades in help messages and man pages for describing a program's interface.

```sh

$ bkx -h

Blockchain explorer

Usage:
  bkx STARTBLOCK ENDBLOCK --net=NETWORK [--logtrans --logblocks --logcontracts]
  bkx FROMCURRENTBLOCK --net=NETWORK [--logtrans --logblocks --logcontracts]

Options:
  -h --help         Show help
  -v --version      Show version
  --net=NETWORK     The network to use. (mainnet, rinkeby, local) [default: local]
  --logtrans        Log summary of each processed transaction
  --logblocks       Log blocks
  --logcontracts    Log created contracts
```

## Examples

__Don't forget to set your environment variables!__

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
