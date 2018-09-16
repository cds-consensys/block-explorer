# Design overview

This comandline utility presents an interface to query an Ethereum block chain
to track transfers of funds. The utility is split into modules that separate
concerns for Input, processing, Web3 access and output.

# Challenges

## Internal transfers / tracking fund transfers that a contract initiates

All transfers are initiated by an externally owned account, ie, one with a
private key. However Ether can be transferred from Smart contracts as well.
Those smart contract sends are not captured in the transaction, or transaction
records, exposed by Web3.

They can however be calculated by executing the smart contract code, with the
inputs in the transaction against the current state of the Ethereum Machine.


### Workaround
This [ethereum stackeschange post](https://ethereum.stackexchange.com/a/3427)
suggests that a solution is to create an instrumented Ethereum VM.

## Network implementation differences

There is possibility of implementation differences across blockchain
    networks.  For example `getTransaction()` returns an object with the
    property `status: '0x01'` on a ganache network while mainnet and rinkeby
    return the object with `status: '0x1'`

### Work around
  - Constrain Web3 access to one module isolating concerns there. This module
    will expose a limited Web3 API interface to interact with the different
    block chains.

 - Lack of knowledge of current best practices and work flow in this space.
   This is an opportunity to investigate the developer flow as well as
   developing the simple blockchain explorer.

# Modules Overview

## CLI

The commandline interface responsible for reading user input, querying the
Explorer and invokes the Reporter to display the Explorer's summary.

## API

This module wraps web3 exposing a promise wrapped interface to its clients

## Explorer

The explorer initializes connection to the API module and looping over to
process transactions in every block in the range. It uses a Ledger to store
report state.

## Ledger

An accumulator to store details about the Transfers, and contracts
created.

## Reporter

Displays a report for the user. It uses the Ledger created by the Explorer.

----

# Sequence diagram

This diagram shows how a user's request to summarize transactions of blocks 6M to 6M+1
flows through the system. The UML source is located [here](./sequence.uml)
```

              ┌───┐           ┌────────┐                                         ┌───┐          ┌────────┐
              │Cli│           │Explorer│                                         │API│          │Reporter│
              └─┬─┘           └───┬────┘                                         └─┬─┘          └───┬────┘
   bkx 6M 6M+1  │                 │                                                │                │
 ───────────────>                 │                                                │                │
                │                 │                                                │                │
                │ track [6M, 6M+1]│                                                │                │
                │  ─ ─ ─ ─ ─ ─ ─ ─>                                                │                │
                │                 │                                                │                │
                │                 │            request Blocks [6M, 6M+1]           │                │
                │                 │ ───────────────────────────────────────────────>                │
                │                 │                                                │                │
                │                 │                                                │                │
          ╔═════╪═╤═══════════════╪════════════════════════════════════════════════╪════════════════╪════╗
          ║ LOOP  │  over all blocks in range                                      │                │    ║
          ╟───────┘               │                                                │                │    ║
          ║     │                 │                                                │                │    ║
          ║     │   ╔═════════════╤════════════════════════════════════════════════╪═══════════╗    │    ║
          ║     │   ║ ACCOUNTING  │                                                │           ║    │    ║
          ║     │   ╟─────────────┘                      block                     │           ║    │    ║
          ║     │   ║             │ <───────────────────────────────────────────────           ║    │    ║
          ║     │   ║             │                                                │           ║    │    ║
          ║     │   ║             │────┐                                                       ║    │    ║
          ║     │   ║             │    │ update Ledger for all transactions in block           ║    │    ║
          ║     │   ║             │<───┘                                                       ║    │    ║
          ║     │   ╚═════════════╪════════════════════════════════════════════════╪═══════════╝    │    ║
          ╚═════╪═════════════════╪════════════════════════════════════════════════╪════════════════╪════╝
                │                 │                                                │                │
                │      Ledger     │                                                │                │
                │ <─ ─ ─ ─ ─ ─ ─ ─                                                 │                │
                │                 │                                                │                │
                │                 │                     Ledger                     │                │
                │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>
              ┌─┴─┐           ┌───┴────┐                                         ┌─┴─┐          ┌───┴────┐
              │Cli│           │Explorer│                                         │API│          │Reporter│
              └───┘           └────────┘                                         └───┘          └────────┘

```
