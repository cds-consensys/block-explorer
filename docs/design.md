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
    networks.  For example ganache* vs (mainnet and rinkeby) differ in the
    value One in the implementation of `getTransaction()`. The `status` attribute is:
       - '0x01' on ganache
       - '0x1' on  mainnet and rinkeby

### Work around
  - Constrain web3 access to one module isolating concerns there. This module
    will expose a limited web3 API interface to interact with the different
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

[Sequence Diagram](./sequence.uml)

            ┌───┐             ┌────────┐                                         ┌───┐          ┌────────┐
            │Cli│             │Explorer│                                         │API│          │Reporter│
            └─┬─┘             └───┬────┘                                         └─┬─┘          └───┬────┘
              │ tally [start, end]│                                                │                │
              │  ─ ─ ─ ─ ─ ─ ─ ─ ─>                                                │                │
              │                   │                                                │                │
              │                   │           request Blocks [start, end]          │                │
              │                   │ ───────────────────────────────────────────────>                │
              │                   │                                                │                │
              │                   │                                                │                │
          ╔═══╪═══╤═══════════════╪════════════════════════════════════════════════╪════════════════╪════╗
          ║ LOOP  │  over all blocks in [start, end]                               │                │    ║
          ╟───────┘               │                                                │                │    ║
          ║   │                   │                                                │                │    ║
          ║   │     ╔═════════════╤════════════════════════════════════════════════╪═══════════╗    │    ║
          ║   │     ║ ACCOUNTING  │                                                │           ║    │    ║
          ║   │     ╟─────────────┘                      block                     │           ║    │    ║
          ║   │     ║             │ <───────────────────────────────────────────────           ║    │    ║
          ║   │     ║             │                                                │           ║    │    ║
          ║   │     ║             │────┐                                                       ║    │    ║
          ║   │     ║             │    │ update Ledger for all transactions in block           ║    │    ║
          ║   │     ║             │<───┘                                                       ║    │    ║
          ║   │     ╚═════════════╪════════════════════════════════════════════════╪═══════════╝    │    ║
          ╚═══╪═══════════════════╪════════════════════════════════════════════════╪════════════════╪════╝
              │                   │                                                │                │
              │       Ledger      │                                                │                │
              │ <─ ─ ─ ─ ─ ─ ─ ─ ─                                                 │                │
              │                   │                                                │                │
              │                   │                display Ledger                  │                │
              │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─>
            ┌─┴─┐             ┌───┴────┐                                         ┌─┴─┐          ┌───┴────┐
            │Cli│             │Explorer│                                         │API│          │Reporter│
            └───┘             └────────┘                                         └───┘          └────────┘

