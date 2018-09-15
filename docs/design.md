# Module overview

## CLI

The commandline interface responsible for reading user input, querying the
Explorer and invokes the Reporter to display the Explorer's summary.

## API

This module wraps web3 and exposes promise wrapped interfaces.

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

